import { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE_NAME, verifyToken } from './jwt';

export interface AuthenticatedUser {
  id: number;
  role: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const user = getAuthenticatedUser(req);

  if (!user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  req.user = user;
  next();
}

export function authorize(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = getAuthenticatedUser(req);

    if (!user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    if (!hasPermission(user, requiredPermission)) {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    req.user = user;
    next();
  };
}

export function getAuthenticatedUser(req: Request): AuthenticatedUser | null {
  const token = req.cookies?.[AUTH_COOKIE_NAME] || getBearerToken(req);

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    role: payload.role,
    permissions: payload.permissions,
  };
}

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  return header.slice('Bearer '.length);
}

export function hasPermission(user: AuthenticatedUser, requiredPermission: string): boolean {
  if (user.role === 'admin') {
    return true;
  }

  return user.permissions.includes(requiredPermission);
}
