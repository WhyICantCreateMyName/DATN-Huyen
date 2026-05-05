import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { successResponse, ErrorResponses } from '../utils/response';

const router = Router();

// POST /api/reviews
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { productId, rating, comment } = req.body;

    if (!userId) return ErrorResponses.unauthorized(res);
    if (!productId || !rating) return ErrorResponses.badRequest(res, 'Thiếu thông tin đánh giá');

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { userId, productId }
    });

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment }
      });
      return successResponse(res, updatedReview, 200, 'Cập nhật đánh giá thành công');
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: Number(rating),
        comment
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return successResponse(res, review, 201, 'Gửi đánh giá thành công');
  } catch (error) {
    console.error('Create review error:', error);
    return ErrorResponses.internalError(res);
  }
});

// GET /api/reviews/product/:productId
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
