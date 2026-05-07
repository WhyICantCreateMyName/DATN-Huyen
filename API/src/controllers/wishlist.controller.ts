import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { successResponse, ErrorResponses } from '../utils/response';
import { toAbsoluteUrls, getBaseUrl } from '../utils/url';

const router = Router();

// GET /api/wishlist
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return ErrorResponses.unauthorized(res);

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: userId },
      include: {
        product: {
          include: {
            variants: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const baseUrl = getBaseUrl(req);
    const products = wishlist.map(item => ({
      ...item.product,
      images: toAbsoluteUrls(JSON.parse(item.product.images), baseUrl)
    }));
    return successResponse(res, products);
  } catch (error) {
    console.error('Get wishlist error:', error);
    return ErrorResponses.internalError(res);
  }
});

// POST /api/wishlist/:productId
router.post('/:productId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.params;

    if (!userId) return ErrorResponses.unauthorized(res);

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return ErrorResponses.notFound(res, 'Sản phẩm không tồn tại');

    // Toggle wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id }
      });
      return successResponse(res, null, 200, 'Đã xóa khỏi danh sách yêu thích');
    } else {
      await prisma.wishlist.create({
        data: { userId, productId }
      });
      return successResponse(res, null, 201, 'Đã thêm vào danh sách yêu thích');
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
