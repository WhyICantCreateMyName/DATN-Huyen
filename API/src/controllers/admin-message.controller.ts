import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth.middleware';
import { successResponse, ErrorResponses } from '../utils/response';

const router = Router();

// All routes here require Admin privileges
router.use(authenticate, isAdmin);

// GET /api/admin/messages - List all customer conversations
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.userId;

    // Lấy tất cả tin nhắn liên quan đến admin này hoặc tin nhắn broadcast từ khách
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: adminId },
          { receiverId: adminId },
          { receiverId: null, senderType: { in: ['USER', 'BOT'] } } // Tin nhắn khách gửi chung cho Admin
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, email: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    const conversationsMap = new Map();

    (messages as any[]).forEach((msg) => {
      // Đối tác là người dùng (không phải admin)
      let partnerId: string | null = null;
      let partner: any = null;

      if (msg.senderType === 'ADMIN') {
        partnerId = msg.receiverId;
        partner = msg.receiver;
      } else {
        partnerId = msg.senderId;
        partner = msg.sender;
      }

      if (!partnerId || !partner || partner.role === 'ADMIN') return;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          id: partnerId,
          partner,
          lastMessage: msg,
          unreadCount: 0
        });
      }

      // Đếm tin nhắn chưa đọc từ khách
      if (msg.senderType !== 'ADMIN' && !msg.isRead) {
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
    const adminId = req.user?.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: adminId, receiverId: userId }, // Admin gửi cho khách
          { senderId: userId, receiverId: adminId }, // Khách gửi riêng cho admin này
          { senderId: userId, receiverId: null }      // Khách gửi broadcast
        ]
      },
      orderBy: { createdAt: 'asc' }
    });

    // Đánh dấu là đã đọc cho các tin nhắn từ khách gửi đến admin này hoặc broadcast
    await prisma.message.updateMany({
      where: {
        senderId: userId,
        OR: [
          { receiverId: adminId },
          { receiverId: null }
        ],
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
