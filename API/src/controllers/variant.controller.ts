import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { successResponse, ErrorResponses } from '../utils/response';
import { createVariantSchema, updateVariantSchema } from '../utils/validations';
import { getBaseUrl, toAbsoluteUrls } from '../utils/url';

const router = Router();

// Apply admin protection
router.use(authenticate);
router.use(isAdmin);

// GET /api/admin/variants
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [variants, count] = await Promise.all([
      prisma.productVariant.findMany({
        include: {
          product: {
            include: {
              category: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.productVariant.count()
    ]);

    const baseUrl = getBaseUrl(req);
    const variantsWithParsedImages = variants.map((v: any) => ({
      ...v,
      product: {
        ...v.product,
        images: toAbsoluteUrls(JSON.parse(v.product.images), baseUrl),
      },
    }));

    return successResponse(res, {
      data: variantsWithParsedImages,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      }
    });
  } catch (error) {
    console.error('Admin Get variants error:', error);
    return ErrorResponses.internalError(res);
  }
});

// POST /api/admin/variants
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createVariantSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const variant = await prisma.productVariant.create({
      data: validation.data,
    });

    return successResponse(res, variant, 201);
  } catch (error) {
    console.error('Admin Create variant error:', error);
    return ErrorResponses.internalError(res);
  }
});

// PUT /api/admin/variants/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateVariantSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const variant = await prisma.productVariant.update({
      where: { id },
      data: validation.data,
    });

    return successResponse(res, variant);
  } catch (error) {
    console.error('Admin Update variant error:', error);
    if ((error as any).code === 'P2025') {
      return ErrorResponses.notFound(res, 'Variant');
    }
    return ErrorResponses.internalError(res);
  }
});

// DELETE /api/admin/variants/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.productVariant.delete({ where: { id } });
    return successResponse(res, { message: 'Đã xóa biến thể' });
  } catch (error) {
    console.error('Admin Delete variant error:', error);
    if ((error as any).code === 'P2025') {
      return ErrorResponses.notFound(res, 'Variant');
    }
    return ErrorResponses.internalError(res);
  }
});

export default router;
