import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { successResponse, ErrorResponses } from '../utils/response';
import { createCategorySchema, updateCategorySchema } from '../utils/validations';
import { slugify } from '../utils/url';

const router = Router();

// ============ PUBLIC ENDPOINTS ============

// GET /api/categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [categories, count] = await Promise.all([
      prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          _count: {
            select: { products: true }
          }
        }
      }),
      prisma.category.count()
    ]);

    return successResponse(res, {
      data: categories,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return ErrorResponses.internalError(res);
  }
});

// GET /api/categories/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return ErrorResponses.notFound(res, 'Category');
    }

    return successResponse(res, category);
  } catch (error) {
    console.error('Get category error:', error);
    return ErrorResponses.internalError(res);
  }
});

// ============ ADMIN ENDPOINTS ============

// POST /api/categories
router.post('/', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const validation = createCategorySchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const category = await prisma.category.create({
      data: {
        ...validation.data,
        slug: validation.data.slug || slugify(validation.data.name)
      },
    });
    return successResponse(res, category, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return ErrorResponses.badRequest(res, 'Slug hoặc tên danh mục đã tồn tại');
    }
    console.error('Admin Create category error:', error);
    return ErrorResponses.internalError(res);
  }
});

// PUT /api/categories/:id
router.put('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateCategorySchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const updateData: any = { ...validation.data };
    
    // If name is being updated but slug is not provided, regenerate slug
    if (updateData.name && !updateData.slug) {
      updateData.slug = slugify(updateData.name);
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });
    return successResponse(res, category);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return ErrorResponses.badRequest(res, 'Slug hoặc tên danh mục đã tồn tại');
    }
    console.error('Admin Update category error:', error);
    return ErrorResponses.internalError(res);
  }
});

// DELETE /api/categories/:id
router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    return successResponse(res, { message: 'Đã xóa danh mục' });
  } catch (error) {
    console.error('Admin Delete category error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
