import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = (process.env.JWT_SECRET || '1231sdfa32r32dasda') as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '15m') as any;
const JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || 'i09ar30jdspjfpa33d') as string;
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any;

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export function signResetToken(payload: { userId: string }): string {
  const options: SignOptions = { expiresIn: '15m' };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyResetToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authorization?: string): string | null {
  if (!authorization) return null;

  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
