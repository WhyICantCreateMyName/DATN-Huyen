import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth.middleware';
import { successResponse, ErrorResponses } from '../utils/response';

const router = Router();

// Apply authentication and admin check to all routes
router.use(authenticate, isAdmin);

// ============ DASHBOARD STATISTICS ============
router.get('/dashboard-stats', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [totalRevenueResult, totalOrders, totalUsers, newUsers, totalReviewsResult, totalReviewsResult2] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({
        where: {
          role: 'USER',
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      prisma.review.aggregate({
        _count: true,
        _avg: { rating: true }
      }),
      prisma.review.groupBy({
        by: ['rating'],
        _count: true
      })
    ]);

    const totalRevenue = Number(totalRevenueResult._sum.totalAmount || 0);
    const totalReviews = totalReviewsResult._count;
    const averageRating = Number((totalReviewsResult._avg.rating || 0).toFixed(1));

    const topRatedProductsRaw = await prisma.review.groupBy({
      by: ['productId'],
      _avg: { rating: true },
      _count: { rating: true },
      orderBy: { _avg: { rating: 'desc' } },
      take: 5
    });

    const topRatedProducts = await Promise.all(
      topRatedProductsRaw.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        });
        return {
          name: product?.name || 'Sản phẩm ẩn',
          rating: Number((item._avg.rating || 0).toFixed(1)),
          count: item._count.rating
        };
      })
    );

    const revenueData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const dayRevenue = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: { not: 'CANCELLED' },
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });

      revenueData.push({
        name: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        revenue: Number(dayRevenue._sum.totalAmount || 0),
        fullDate: date.toLocaleDateString('vi-VN')
      });
    }

    const topProducts = await prisma.orderItem.groupBy({
      by: ['variantId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProductsDetails = await Promise.all(
      topProducts.map(async (item) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: { select: { name: true, images: true, category: true } } }
        });
        return {
          id: item.variantId,
          name: variant?.product.name,
          category: variant?.product.category?.name,
          images: variant?.product.images ? JSON.parse(variant.product.images) : [],
          sales: item._sum.quantity,
          price: Number(variant?.price || 0)
        };
      })
    );

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    });

    return successResponse(res, {
      stats: {
        totalRevenue,
        totalOrders,
        totalUsers,
        newUsers,
        totalReviews,
        averageRating,
        topRatedProducts,
        conversionRate: 3.42
      },
      revenueData,
      topProducts: topProductsDetails,
      recentActivities: recentOrders.map(o => ({
        id: o.id,
        user: o.customerName,
        action: `đã đặt đơn hàng trị giá ${Number(o.totalAmount).toLocaleString('vi-VN')}đ`,
        time: o.createdAt,
        type: 'order'
      }))
    });
  } catch (error) {
    console.error('Admin Get dashboard stats error:', error);
    return ErrorResponses.internalError(res);
  }
});

router.get('/online', async (req: AuthRequest, res: Response) => {
  return successResponse(res, { online: true, timestamp: new Date() });
});

export default router;
