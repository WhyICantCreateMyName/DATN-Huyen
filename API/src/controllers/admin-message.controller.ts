import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth.middleware';
import { successResponse, ErrorResponses } from '../utils/response';

const router = Router();

// All routes here require Admin privileges
router.use(authenticate, isAdmin);

const SHOP_ID = 'cb691d24-0bc0-4831-bd01-66d2cbb6c3d1';

// GET /api/admin/messages - List all customer conversations
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: SHOP_ID },
          { receiverId: SHOP_ID }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    const conversationsMap = new Map();

    messages.forEach((msg) => {
      const partnerId = msg.senderId === SHOP_ID ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === SHOP_ID ? msg.receiver : msg.sender;

      if (!partner || partner.role !== 'USER') return;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          id: partnerId,
          partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }

      if (msg.receiverId === SHOP_ID && !msg.isRead) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    return successResponse(res, Array.from(conversationsMap.values()));
  } catch (error) {
    console.error('Admin Get messages list error:', error);
    return ErrorResponses.internalError(res);
  }
});

// GET /api/admin/messages/:userId - Get full history with a user
router.get('/:userId', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: SHOP_ID, receiverId: userId },
          { senderId: userId, receiverId: SHOP_ID }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark as read
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        receiverId: SHOP_ID,
        isRead: false
      },
      data: { isRead: true, readAt: new Date() }
    });

    return successResponse(res, messages);
  } catch (error) {
    console.error('Admin Get user message history error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
