import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth.middleware';
import { successResponse, errorResponse, ErrorResponses } from '../utils/response';
import { createPurchaseInvoiceSchema } from '../utils/validations';
import { getBaseUrl, toAbsoluteUrls } from '../utils/url';

const router = Router();

// All routes here require Admin privileges
router.use(authenticate, isAdmin);

// GET /api/admin/purchase-invoices - List purchase invoices
router.get('/', async (req: AuthRequest, res: Response) => {
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

// GET /api/admin/purchase-invoices/:id - Get single invoice
router.get('/:id', async (req: AuthRequest, res: Response) => {
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

// POST /api/admin/purchase-invoices - Create purchase invoice
router.post('/', async (req: AuthRequest, res: Response) => {
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

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);

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
            costPrice: item.costPrice,
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

// PUT /api/admin/purchase-invoices/:id - Update invoice basic info
router.put('/:id', async (req: AuthRequest, res: Response) => {
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

// DELETE /api/admin/purchase-invoices/:id - Delete invoice
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

export default router;
