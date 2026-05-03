import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth.middleware';
import { successResponse, errorResponse, ErrorResponses } from '../utils/response';
import { createOrderSchema, updateOrderStatusSchema, updatePaymentStatusSchema } from '../utils/validations';

const router = Router();

// Apply authentication to all order routes
router.use(authenticate);

// ============ USER ENDPOINTS ============

// POST /api/orders - Create Order
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const validation = createOrderSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const { 
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      notes,
      paymentMethod = 'COD' 
    } = validation.data;

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { variant: true }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return errorResponse(res, 'Giỏ hàng trống', 400);
    }

    // Check stock
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        return errorResponse(
          res,
          `Sản phẩm ${item.variant.size} - ${item.variant.color} chỉ còn ${item.variant.stock} trong kho`,
          400
        );
      }
    }

    const totalAmount = cart.items.reduce(
      (sum: number, item: any) => sum + Number(item.variant.price) * item.quantity,
      0
    );

    // Execute order creation in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          customerName,
          customerPhone,
          customerEmail,
          shippingAddress,
          notes,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        }
      });

      // 2. Create Order Items
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant.price,
          }
        });

        // 3. Decrement stock if COD
        if (paymentMethod === 'COD') {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      // 4. Clear cart if COD
      if (paymentMethod === 'COD') {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id }
        });
      }

      return order;
    });

    return successResponse(res, result, 201);
  } catch (error) {
    console.error('Create order error:', error);
    return ErrorResponses.internalError(res);
  }
});

// GET /api/orders - List user orders
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { id: true, name: true, images: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = orders.map((order: any) => ({
      ...order,
      items: order.items.map((item: any) => ({
        ...item,
        variant: {
          ...item.variant,
          product: {
            ...item.variant.product,
            images: JSON.parse(item.variant.product.images),
          }
        }
      }))
    }));

    return successResponse(res, result);
  } catch (error) {
    console.error('Get orders error:', error);
    return ErrorResponses.internalError(res);
  }
});

// GET /api/orders/:id - Order detail
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { id: true, name: true, images: true }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return ErrorResponses.notFound(res, 'Order');
    }

    const result = {
      ...order,
      items: order.items.map((item: any) => ({
        ...item,
        variant: {
          ...item.variant,
          product: {
            ...item.variant.product,
            images: JSON.parse(item.variant.product.images),
          }
        }
      }))
    };

    return successResponse(res, result);
  } catch (error) {
    console.error('Get order detail error:', error);
    return ErrorResponses.internalError(res);
  }
});

// ============ ADMIN ENDPOINTS ============

// GET /api/orders/admin - List all orders (Admin)
router.get('/admin/list', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '', status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status as any;
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search as string, mode: 'insensitive' } },
        { customerPhone: { contains: search as string, mode: 'insensitive' } },
        { id: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [orders, count] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: { id: true, name: true, images: true }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.order.count({ where })
    ]);

    const formattedOrders = orders.map((order: any) => ({
      ...order,
      items: order.items.map((item: any) => {
        let images = [];
        try {
          images = typeof item.variant.product.images === 'string' 
            ? JSON.parse(item.variant.product.images) 
            : item.variant.product.images;
        } catch (e) {
          images = [];
        }
        return {
          ...item,
          variant: {
            ...item.variant,
            product: {
              ...item.variant.product,
              images
            }
          }
        };
      })
    }));

    return successResponse(res, {
      data: formattedOrders,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      }
    });
  } catch (error) {
    console.error('Admin Get orders error:', error);
    return ErrorResponses.internalError(res);
  }
});

// PUT /api/orders/:id/status - Update Status (Admin)
router.put('/:id/status', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateOrderStatusSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: validation.data.status }
    });

    return successResponse(res, order);
  } catch (error) {
    console.error('Admin Update order status error:', error);
    return ErrorResponses.internalError(res);
  }
});

// PUT /api/orders/:id/payment - Update Payment Status (Admin)
router.put('/:id/payment', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updatePaymentStatusSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus: validation.data.paymentStatus }
    });

    return successResponse(res, order);
  } catch (error) {
    console.error('Admin Update payment status error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
