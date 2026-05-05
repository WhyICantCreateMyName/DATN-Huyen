import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth.middleware';
import { successResponse, errorResponse, ErrorResponses } from '../utils/response';
import bcrypt from 'bcrypt';

const router = Router();

// All routes here require Admin privileges
router.use(authenticate, isAdmin);

// GET /api/admin/users - List all staff/admin users
router.get('/', async (req: AuthRequest, res: Response) => {
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

// POST /api/admin/users - Create new staff/admin
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email đã tồn tại', 400);
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'USER',
      }
    });

    return successResponse(res, user, 201);
  } catch (error) {
    console.error('Admin Create user error:', error);
    return ErrorResponses.internalError(res);
  }
});

// PUT /api/admin/users/:id - Update user
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Protection: Can't demote self
    if (id === req.user!.userId && role && role !== 'ADMIN') {
      return errorResponse(res, 'Không thể tự giáng chức chính mình', 400);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role }
    });

    return successResponse(res, user);
  } catch (error) {
    console.error('Admin Update user error:', error);
    return ErrorResponses.internalError(res);
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Protection: Can't delete self
    if (id === req.user!.userId) {
      return errorResponse(res, 'Không thể tự xóa chính mình', 400);
    }

    await prisma.user.delete({ where: { id } });

    return successResponse(res, { message: 'Đã xóa tài khoản thành công' });
  } catch (error) {
    console.error('Admin Delete user error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
