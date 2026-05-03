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

  let context = "📦 SẢN PHẨM PHÙ HỢP:\n";
  products.forEach((p, idx) => {
    const productUrl = `${baseUrl}/products/${p.id}`;
    context += `\n${idx + 1}. **[${p.name}](${productUrl})**\n`;

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

    context += `   ⚠️ LINK XEM CHI TIẾT (BẮT BUỘC PHẢI DÙNG ĐÚNG URL NÀY): ${productUrl}\n`;
  });

  return context;
}

// POST /api/messages - Chat with AI (Integrated from legacy bot)
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content, conversationHistory } = req.body;

    if (!content) {
      return ErrorResponses.badRequest(res, 'Nội dung tin nhắn không được để trống');
    }

    // 1. Analyze intent & budget
    const intent = analyzeIntent(content);
    const budget = extractBudget(content);

    // 2. Fetch relevant products if needed
    let relevantProducts: any[] = [];
    if (intent.type === 'product_search' || intent.type === 'compare') {
      const searchResults = await QdrantService.searchProducts(content, 10);

      // Fetch full product data from Prisma to ensure fresh data
      const productIds = searchResults.map((r: any) => r.id);
      let productsFromDb = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { category: true, variants: true }
      });

      // Filter by budget if specified
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

    // 3. Build context & generate response
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

    // 4. Return result matching legacy response format
    return successResponse(res, {
      response: aiResponse,
      products: relevantProducts.slice(0, 3).map(p => ({
        ...p,
        images: JSON.parse(p.images)
      })),
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
