import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { successResponse, ErrorResponses } from '../utils/response';
import { toAbsoluteUrls, getBaseUrl } from '../utils/url';
import { createProductSchema, updateProductSchema } from '../utils/validations';

const router = Router();

// GET /api/products
router.get('/', async (req: Request, res: Response) => {
  try {
    const { categoryId, page = '1', limit = '12', search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = {};
    if (categoryId && typeof categoryId === 'string') {
      where.categoryId = categoryId;
    }
    if (search && typeof search === 'string') {
      where.name = {
        contains: search,
      };
    }

    const [count, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          variants: {
            select: { id: true, size: true, color: true, price: true, stock: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      })
    ]);

    const baseUrl = getBaseUrl(req);
    const productsWithParsedImages = products.map((p: any) => ({
      ...p,
      images: toAbsoluteUrls(JSON.parse(p.images), baseUrl),
    }));

    return successResponse(res, {
      data: productsWithParsedImages,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return ErrorResponses.internalError(res);
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        variants: {
          select: { id: true, size: true, color: true, price: true, stock: true }
        }
      },
    });

    if (!product) {
      return ErrorResponses.notFound(res, 'Product');
    }

    const baseUrl = getBaseUrl(req);
    const productWithParsedImages = {
      ...product,
      images: toAbsoluteUrls(JSON.parse(product.images), baseUrl),
    };

    return successResponse(res, productWithParsedImages);
  } catch (error) {
    console.error('Get product error:', error);
    return ErrorResponses.internalError(res);
  }
});


// POST /api/products
router.post('/', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const validation = createProductSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const { images, variants, ...data } = validation.data;
    const product = await prisma.product.create({
      data: {
        ...data,
        images: JSON.stringify(images),
        variants: variants ? {
          create: variants.map(v => ({
            size: v.size,
            color: v.color,
            price: v.price,
            stock: v.stock,
          }))
        } : undefined
      },
      include: { category: true, variants: true },
    });

    return successResponse(
      res,
      {
        ...product,
        images: JSON.parse(product.images),
      },
      201,
    );
  } catch (error) {
    console.error('Admin Create product error:', error);
    return ErrorResponses.internalError(res);
  }
});

// PUT /api/products/:id
router.put('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateProductSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const { images, variants, ...data } = validation.data;

    const result = await prisma.$transaction(async (tx) => {
      const updateData: any = { ...data };
      if (images) {
        updateData.images = JSON.stringify(images);
      }

      const product = await tx.product.update({
        where: { id },
        data: updateData,
        include: { category: true, variants: true },
      });

      if (variants) {
        const variantIds = variants.filter(v => v.id).map(v => v.id as string);

        await tx.productVariant.deleteMany({
          where: {
            productId: id,
            id: { notIn: variantIds }
          }
        });

        for (const v of variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                size: v.size,
                color: v.color,
                price: v.price,
                stock: v.stock,
              }
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                size: v.size,
                color: v.color,
                price: v.price,
                stock: v.stock,
              }
            });
          }
        }
      }

      return await tx.product.findUnique({
        where: { id },
        include: { category: true, variants: true }
      });
    });

    if (!result) return ErrorResponses.notFound(res, 'Product');

    return successResponse(res, {
      ...result,
      images: JSON.parse(result.images),
    });
  } catch (error) {
    console.error('Admin Update product error:', error);
    return ErrorResponses.internalError(res);
  }
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return successResponse(res, { message: 'Đã xóa sản phẩm' });
  } catch (error) {
    console.error('Admin Delete product error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
