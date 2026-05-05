import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { successResponse, errorResponse, ErrorResponses } from '../utils/response';
import { createPaymentUrl, verifyReturnUrl } from '../utils/vnpay';

const router = Router();

// POST /api/payment/vnpay/create
router.post('/vnpay/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.userId },
    });

    if (!order) {
      return ErrorResponses.notFound(res, 'Order');
    }

    if (order.paymentStatus !== 'PENDING') {
      return errorResponse(res, 'Đơn hàng đã được thanh toán hoặc không hợp lệ', 400);
    }

    const ipAddr = req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const amount = Number(order.totalAmount);
    const orderInfo = `Thanh toan don hang ${orderId}`;

    const paymentUrl = createPaymentUrl(orderId, amount, orderInfo, ipAddr);

    return successResponse(res, { paymentUrl });
  } catch (error) {
    console.error('Create VNPay payment error:', error);
    return ErrorResponses.internalError(res);
  }
});

// GET /api/payment/vnpay/callback
router.get('/vnpay/callback', async (req: Request, res: Response) => {
  try {
    const vnpParams = req.query;

    const isValid = verifyReturnUrl({ ...vnpParams });
    if (!isValid) {
      return res.redirect('/payment/failed?reason=invalid_signature');
    }

    const { vnp_TxnRef: orderId, vnp_ResponseCode: responseCode } = vnpParams as any;

    if (responseCode === '00') {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true }
        });
        if (!order) throw new Error('Order not found');

        if (order.paymentStatus !== PaymentStatus.PENDING) {
          return order;
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: PaymentStatus.PAID,
            status: OrderStatus.PROCESSING
          }
        });

        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } }
          });
        }

        const cart = await tx.cart.findFirst({ where: { userId: order.userId } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        return order;
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
      return res.redirect(`${frontendUrl}/payment/success?orderId=${orderId}`);
    } else {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
      return res.redirect(`${frontendUrl}/payment/failed?reason=payment_failed&code=${responseCode}`);
    }
  } catch (error) {
    console.error('VNPay callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000';
    return res.redirect(`${frontendUrl}/payment/failed?reason=system_error`);
  }
});

export default router;
