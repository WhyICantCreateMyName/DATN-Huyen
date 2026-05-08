import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { successResponse, ErrorResponses } from '../utils/response';
import { createCollectionSchema, updateCollectionSchema } from '../utils/validations';
import { slugify } from '../utils/url';

const router = Router();

// ============ PUBLIC ENDPOINTS ============

// GET /api/collections
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', activeOnly = 'false' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const isActive = activeOnly === 'true';

    const where: any = {};
    if (isActive) {
      where.isActive = true;
    }

    const [collections, count] = await Promise.all([
      prisma.collection.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          _count: {
            select: { products: true }
          }
        }
      }),
      prisma.collection.count({ where })
    ]);

    return successResponse(res, {
      data: collections,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      }
    });
  } catch (error) {
    console.error('Get collections error:', error);
    return ErrorResponses.internalError(res);
  }
});

// GET /api/collections/:id or :slug
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const collection = await prisma.collection.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug }
        ]
      },
      include: {
        products: {
          include: {
            category: true,
            variants: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!collection) {
      return ErrorResponses.notFound(res, 'Collection');
    }

    return successResponse(res, collection);
  } catch (error) {
    console.error('Get collection error:', error);
    return ErrorResponses.internalError(res);
  }
});

// ============ ADMIN ENDPOINTS ============

// POST /api/collections
router.post('/', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const validation = createCollectionSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const { productIds, ...data } = validation.data;
    const collection = await prisma.collection.create({
      data: {
        ...data,
        slug: data.slug || slugify(data.name),
        products: productIds ? {
          connect: productIds.map(id => ({ id }))
        } : undefined
      },
    });
    return successResponse(res, collection, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return ErrorResponses.badRequest(res, 'Slug hoặc tên bộ sưu tập đã tồn tại');
    }
    console.error('Admin Create collection error:', error);
    return ErrorResponses.internalError(res);
  }
});

// PUT /api/collections/:id
router.put('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateCollectionSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const { productIds, ...data } = validation.data;
    const updateData: any = { ...data };
    
    if (updateData.name && !updateData.slug) {
      updateData.slug = slugify(updateData.name);
    }

    if (productIds) {
      updateData.products = {
        set: productIds.map(id => ({ id }))
      };
    }

    const collection = await prisma.collection.update({
      where: { id },
      data: updateData,
    });
    return successResponse(res, collection);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return ErrorResponses.badRequest(res, 'Slug hoặc tên bộ sưu tập đã tồn tại');
    }
    console.error('Admin Update collection error:', error);
    return ErrorResponses.internalError(res);
  }
});

// DELETE /api/collections/:id
router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.collection.delete({ where: { id } });
    return successResponse(res, { message: 'Đã xóa bộ sưu tập' });
  } catch (error) {
    console.error('Admin Delete collection error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
