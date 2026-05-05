import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth.middleware';
import { successResponse, errorResponse, ErrorResponses } from '../utils/response';
import bcrypt from 'bcrypt';

const router = Router();

// All routes here require Admin privileges
router.use(authenticate, isAdmin);

// GET /api/admin/customers - List customers
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = { role: 'USER' };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.user.count({ where })
    ]);

    return successResponse(res, {
      data: customers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Admin Get customers error:', error);
    return ErrorResponses.internalError(res);
  }
});

// POST /api/admin/customers - Create customer
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email đã tồn tại', 400);
    }

    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    const customer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        role: 'USER',
      }
    });

    return successResponse(res, customer, 201);
  } catch (error) {
    console.error('Admin Create customer error:', error);
    return ErrorResponses.internalError(res);
  }
});

// PUT /api/admin/customers/:id - Update customer
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const customer = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
      }
    });

    return successResponse(res, customer);
  } catch (error) {
    console.error('Admin Update customer error:', error);
    return ErrorResponses.internalError(res);
  }
});

// DELETE /api/admin/customers/:id - Delete customer
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const orderCount = await prisma.order.count({ where: { userId: id } });
    if (orderCount > 0) {
      return errorResponse(res, 'Không thể xóa khách hàng đã có đơn hàng', 400);
    }

    await prisma.user.delete({ where: { id } });

    return successResponse(res, { message: 'Đã xóa khách hàng thành công' });
  } catch (error) {
    console.error('Admin Delete customer error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
