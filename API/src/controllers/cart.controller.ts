import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { successResponse, errorResponse, ErrorResponses } from '../utils/response';
import { addToCartSchema, updateCartItemSchema } from '../utils/validations';
import { toAbsoluteUrls, getBaseUrl } from '../utils/url';

const router = Router();

// Apply authentication to all cart routes
router.use(authenticate);

// GET /api/cart
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    let cart = await prisma.cart.findFirst({
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
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
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
    }

    const baseUrl = getBaseUrl(req);
    const items = cart.items.map((item: any) => ({
      ...item,
      variant: {
        ...item.variant,
        product: {
          ...item.variant.product,
          images: toAbsoluteUrls(JSON.parse(item.variant.product.images), baseUrl),
        },
      },
    }));

    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + Number(item.variant.price) * item.quantity,
      0
    );

    const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return successResponse(res, {
      ...cart,
      items,
      totalAmount,
      totalItems,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return ErrorResponses.internalError(res);
  }
});

// POST /api/cart/items
router.post('/items', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const validation = addToCartSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const { variantId, quantity } = validation.data;

    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) {
      return ErrorResponses.notFound(res, 'Product variant');
    }

    if (variant.stock < quantity) {
      return errorResponse(res, 'Số lượng vượt quá tồn kho', 400);
    }

    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, variantId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (variant.stock < newQuantity) {
        return errorResponse(res, 'Số lượng vượt quá tồn kho', 400);
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
        }
      });
    }

    return successResponse(res, { message: 'Đã thêm vào giỏ hàng' }, 201);
  } catch (error) {
    console.error('Add to cart error:', error);
    return ErrorResponses.internalError(res);
  }
});

// PUT /api/cart/items/:id
router.put('/items/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateCartItemSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const { quantity } = validation.data;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { variant: true }
    });

    if (!cartItem) {
      return ErrorResponses.notFound(res, 'Cart item');
    }

    if (cartItem.variant.stock < quantity) {
      return errorResponse(res, 'Số lượng vượt quá tồn kho', 400);
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });

    return successResponse(res, { message: 'Đã cập nhật giỏ hàng' });
  } catch (error) {
    console.error('Update cart item error:', error);
    return ErrorResponses.internalError(res);
  }
});

// DELETE /api/cart/items/:id
router.delete('/items/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.cartItem.delete({ where: { id } });
    return successResponse(res, { message: 'Đã xóa khỏi giỏ hàng' });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
