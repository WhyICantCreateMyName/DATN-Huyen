import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { successResponse, ErrorResponses } from '../utils/response';
import { AiService } from '../services/ai.service';
import { QdrantService } from '../services/qdrant.service';
import { analyzeIntent, extractBudget } from '../utils/ai-helpers';
import prisma from '../lib/prisma';
import { getBaseUrl } from '../utils/url';

const router = Router();

/**
 * Format product data for Gemini context
 */
function createProductContext(products: any[], baseUrl: string): string {
  if (!products || products.length === 0) {
    return "KHÔNG TÌM THẤY SẢN PHẨM PHÙ HỢP. Hãy xin lỗi khách hàng và gợi ý họ thử tìm kiếm với tiêu chí khác.";
  }

  let context = "SẢN PHẨM PHÙ HỢP:\n";
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  products.forEach((p, idx) => {
    const productUrl = `${frontendUrl}/product/${p.id}`;

    let imageUrl = '';
    try {
      const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      if (Array.isArray(images) && images.length > 0) {
        const firstImg = images[0];
        if (firstImg.startsWith('http')) {
          imageUrl = firstImg;
        } else {
          imageUrl = `${baseUrl}/uploads/${firstImg}`;
        }
      }
    } catch (e) { }

    context += `\n${idx + 1}. **[${p.name}](${productUrl})**\n`;
    if (imageUrl) {
      context += `   ![IMG](${imageUrl})\n`;
    }

    if (p.variants && p.variants.length > 0) {
      const prices = p.variants.map((v: any) => parseFloat(v.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        context += `   - Giá: ${minPrice.toLocaleString('vi-VN')}đ\n`;
      } else {
        context += `   - Giá: ${minPrice.toLocaleString('vi-VN')}đ - ${maxPrice.toLocaleString('vi-VN')}đ\n`;
      }

      const sizes = [...new Set(p.variants.map((v: any) => v.size))];
      context += `   - Size: ${sizes.join(', ')}\n`;

      const colors = [...new Set(p.variants.map((v: any) => v.color))];
      context += `   - Màu: ${colors.join(', ')}\n`;
    }

    if (p.description) {
      context += `   - Mô tả: ${p.description.substring(0, 200)}...\n`;
    }

    context += `   LINK XEM CHI TIẾT: ${productUrl}\n`;
  });

  return context;
}

// GET /api/messages - Get current user's chat history with shop
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return ErrorResponses.unauthorized(res);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    return successResponse(res, messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    return ErrorResponses.internalError(res);
  }
});

// POST /api/messages - Chat with AI (Integrated from legacy bot)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content, conversationHistory } = req.body;
    const userId = req.user!.userId;

    if (!content) {
      return ErrorResponses.badRequest(res, 'Nội dung tin nhắn không được để trống');
    }

    // Tạo tin nhắn gửi cho hệ thống (receiverId = null)
    await prisma.message.create({
      data: {
        senderId: userId,
        receiverId: null, // Gửi cho Ban quản trị
        content,
        senderType: 'USER',
        isRead: false
      }
    });

    const intent = analyzeIntent(content);
    const budget = extractBudget(content);

    let relevantProducts: any[] = [];
    if (intent.type === 'product_search' || intent.type === 'compare') {
      const searchResults = await QdrantService.searchProducts(content, 10);

      const productIds = searchResults.map((r: any) => r.id);
      let productsFromDb = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { category: true, variants: true }
      });

      if (budget.min !== null || budget.max !== null) {
        productsFromDb = productsFromDb.filter((p: any) => {
          const prices = p.variants.map((v: any) => parseFloat(v.price.toString()));
          const productMax = Math.max(...prices);
          const productMin = Math.min(...prices);

          if (budget.max !== null && productMin > budget.max) return false;
          if (budget.min !== null && productMax < budget.min) return false;
          return true;
        });
      }
      relevantProducts = productsFromDb.slice(0, 5);
    }

    const systemPrompt = AiService.getSystemPrompt();
    const productContext = createProductContext(relevantProducts, getBaseUrl(req));

    let fullPrompt = `${systemPrompt}\n\n`;
    if (conversationHistory && Array.isArray(conversationHistory)) {
      fullPrompt += "LỊCH SỬ TRÒ CHUYỆN:\n";
      conversationHistory.slice(-6).forEach((msg: any) => {
        const role = msg.role === 'user' ? 'Khách' : 'Bot';
        fullPrompt += `${role}: ${msg.content}\n`;
      });
    }
    fullPrompt += `\nDANH SÁCH SẢN PHẨM ĐANG CÓ TRONG KHO:\n${productContext}\n`;
    fullPrompt += `\nKhách hàng: ${content}\n`;
    fullPrompt += "Bot:";

    const aiResponse = await AiService.generateResponse(fullPrompt);

    // Lấy đại diện 1 admin để làm senderId cho Bot
    const firstAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    const botMessage = await prisma.message.create({
      data: {
        senderId: firstAdmin?.id || userId, // Nếu không có admin thì tạm lấy chính user (tránh crash)
        receiverId: userId,
        content: aiResponse,
        senderType: 'BOT',
        isRead: false
      }
    });

    const { io } = require('../server');
    if (io) {
      io.to(`user:${userId}`).emit('message', botMessage);
    }

    return successResponse(res, {
      response: aiResponse,
      products: relevantProducts.slice(0, 3).map(p => {
        let parsedImages = [];
        try {
          parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        } catch (e) {
          console.error(`Error parsing images for product ${p.id}:`, e);
        }
        return {
          ...p,
          images: parsedImages
        };
      }),
      intent: intent,
      requires_human: intent.requires_human
    });

  } catch (error) {
    console.error('Chat error:', error);
    return ErrorResponses.internalError(res);
  }
});

// POST /api/messages/refresh-index - Refresh Qdrant index (Admin only)
router.post('/refresh-index', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return ErrorResponses.forbidden(res);
    }

    await QdrantService.indexAllProducts();
    return successResponse(res, { message: 'Đã cập nhật chỉ mục tìm kiếm AI' });
  } catch (error) {
    console.error('Refresh index error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
