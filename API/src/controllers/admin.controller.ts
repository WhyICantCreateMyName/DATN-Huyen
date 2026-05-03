import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth.middleware';
import { successResponse, errorResponse, ErrorResponses } from '../utils/response';
import {
  createPurchaseInvoiceSchema,
} from '../utils/validations';
import { getBaseUrl, toAbsoluteUrls } from '../utils/url';

const router = Router();

// Apply authentication and admin check to all routes
router.use(authenticate);
router.use(isAdmin);

// ============ STATS ============
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalProducts, totalOrders, revenueData, pendingOrders, processingOrders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
    ]);

    return successResponse(res, {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Number(revenueData._sum.totalAmount) || 0,
      pendingOrders,
      processingOrders,
    });
  } catch (error) {
    console.error('Admin Get stats error:', error);
    return ErrorResponses.internalError(res);
  }
});

// ============ USERS MANAGEMENT ============
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.user.count({ where })
    ]);

    return successResponse(res, {
      data: users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Admin Get users error:', error);
    return ErrorResponses.internalError(res);
  }
});

router.put('/users/:id/role', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return errorResponse(res, 'Role không hợp lệ', 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    return successResponse(res, user);
  } catch (error) {
    console.error('Admin Update user role error:', error);
    return ErrorResponses.internalError(res);
  }
});

// ============ PURCHASE INVOICES (Inventory) ============
router.get('/purchase-invoices', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [invoices, count] = await Promise.all([
      prisma.purchaseInvoice.findMany({
        include: {
          creator: { select: { name: true } },
          items: {
            include: {
              variant: {
                include: { product: { select: { name: true } } }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.purchaseInvoice.count()
    ]);

    return successResponse(res, {
      data: invoices,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      }
    });
  } catch (error) {
    console.error('Admin Get purchase invoices error:', error);
    return ErrorResponses.internalError(res);
  }
});

router.get('/purchase-invoices/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.purchaseInvoice.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true, email: true } },
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

    if (!invoice) {
      return ErrorResponses.notFound(res, 'Purchase Invoice');
    }

    const baseUrl = getBaseUrl(req);
    const invoiceJSON = {
      ...invoice,
      items: invoice.items.map((item: any) => ({
        ...item,
        variant: {
          ...item.variant,
          product: {
            ...item.variant.product,
            images: toAbsoluteUrls(JSON.parse(item.variant.product.images), baseUrl),
          }
        }
      }))
    };

    return successResponse(res, invoiceJSON);
  } catch (error) {
    console.error('Admin Get purchase invoice error:', error);
    return ErrorResponses.internalError(res);
  }
});

router.post('/purchase-invoices', async (req: AuthRequest, res: Response) => {
  try {
    const validation = createPurchaseInvoiceSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const { items, ...invoiceData } = validation.data;

    const existingInvoice = await prisma.purchaseInvoice.findUnique({
      where: { invoiceNumber: invoiceData.invoiceNumber },
    });

    if (existingInvoice) {
      return errorResponse(res, 'Số hóa đơn đã tồn tại', 400);
    }

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const invoice = await tx.purchaseInvoice.create({
        data: {
          ...invoiceData,
          totalAmount,
          createdBy: req.user!.userId,
        },
      });

      for (const item of items) {
        await tx.purchaseInvoiceItem.create({
          data: {
            purchaseInvoiceId: invoice.id,
            variantId: item.variantId,
            quantity: item.quantity,
            costPrice: item.unitPrice,
          },
        });

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return invoice;
    });

    return successResponse(res, result, 201);
  } catch (error) {
    console.error('Admin Create purchase invoice error:', error);
    return ErrorResponses.internalError(res);
  }
});

router.put('/purchase-invoices/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { supplierName, supplierPhone, supplierAddress, notes, status } = req.body;

    const invoice = await prisma.purchaseInvoice.update({
      where: { id },
      data: {
        supplierName,
        supplierPhone,
        supplierAddress,
        notes,
        status
      }
    });

    return successResponse(res, invoice);
  } catch (error) {
    console.error('Admin Update purchase invoice error:', error);
    return ErrorResponses.internalError(res);
  }
});

router.delete('/purchase-invoices/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const invoice = await tx.purchaseInvoice.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!invoice) {
        throw new Error('NOT_FOUND');
      }

      if (invoice.status !== 'CANCELLED') {
        for (const item of invoice.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
        }
      }

      await tx.purchaseInvoiceItem.deleteMany({ where: { purchaseInvoiceId: id } });
      await tx.purchaseInvoice.delete({ where: { id } });

      return true;
    });

    return successResponse(res, { message: 'Đã xóa hóa đơn nhập và hoàn tác tồn kho' });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return ErrorResponses.notFound(res, 'Purchase Invoice');
    }
    console.error('Admin Delete purchase invoice error:', error);
    return ErrorResponses.internalError(res);
  }
});

// ============ ONLINE STATUS ============
router.get('/online', async (req: AuthRequest, res: Response) => {
  return successResponse(res, { online: true, timestamp: new Date() });
});

export default router;
