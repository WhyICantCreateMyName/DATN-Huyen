import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '../utils/jwt';
import { ErrorResponses } from '../utils/response';

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return ErrorResponses.unauthorized(res);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return ErrorResponses.unauthorized(res);
  }

  req.user = decoded;
  next();
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ErrorResponses.unauthorized(res);
    }

    if (!roles.includes(req.user.role)) {
      return ErrorResponses.forbidden(res);
    }

    next();
  };
};

export const isAdmin = authorize(['ADMIN']);
