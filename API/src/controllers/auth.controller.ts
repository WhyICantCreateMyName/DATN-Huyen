import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { signToken, signRefreshToken, verifyRefreshToken, signResetToken, verifyResetToken } from '../utils/jwt';
import { successResponse, errorResponse, ErrorResponses } from '../utils/response';
import { loginSchema, registerSchema } from '../utils/validations';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { sendResetPasswordEmail } from '../utils/mail';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const { email, password, name } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email đã được sử dụng', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = signToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(res, { user: userWithoutPassword, token, refreshToken }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return ErrorResponses.internalError(res);
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return ErrorResponses.validationError(res, validation.error.issues[0].message);
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401);
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const token = signToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const { password: _, ...userWithoutPassword } = user;

    return successResponse(res, { user: userWithoutPassword, token, refreshToken });
  } catch (error) {
    console.error('Login error:', error);
    return ErrorResponses.internalError(res);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return ErrorResponses.unauthorized(res);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return ErrorResponses.notFound(res, 'User');
    }

    return successResponse(res, user);
  } catch (error) {
    console.error('Get profile error:', error);
    return ErrorResponses.internalError(res);
  }
});

// PATCH /api/auth/profile
router.patch('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user?.userId;

    if (!userId) return ErrorResponses.unauthorized(res);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return successResponse(res, userWithoutPassword, 200, 'Cập nhật thông tin thành công');
  } catch (error) {
    console.error('Update profile error:', error);
    return ErrorResponses.internalError(res);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const newToken = signToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    return successResponse(res, { token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    return ErrorResponses.internalError(res);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 'Email là bắt buộc', 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security, don't reveal if user exists.
      return successResponse(res, null, 200, 'Nếu email tồn tại, link reset đã được gửi.');
    }

    const resetToken = signResetToken({ userId: user.id });
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await sendResetPasswordEmail(email, resetLink);

    return successResponse(res, null, 200, 'Link reset mật khẩu đã được gửi qua email.');
  } catch (error) {
    console.error('Forgot password error:', error);
    return ErrorResponses.internalError(res);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return errorResponse(res, 'Token và mật khẩu là bắt buộc', 400);

    const payload = verifyResetToken(token);
    if (!payload) {
      return errorResponse(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashedPassword }
    });

    return successResponse(res, null, 200, 'Mật khẩu đã được cập nhật thành công.');
  } catch (error) {
    console.error('Reset password error:', error);
    return ErrorResponses.internalError(res);
  }
});

export default router;
