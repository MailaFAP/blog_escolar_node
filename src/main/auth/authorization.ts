import { NextFunction, Request, Response } from 'express';
import { AUTH_COOKIE_NAME, verifyToken } from './jwt';
import { database } from '../../infra/database';

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

async function loadCurrentUser(req: Request): Promise<AuthenticatedUser | null> {
  const tokenUser = getAuthenticatedUser(req);
  if (!tokenUser) return null;
  const result = await database.query('SELECT id, role, permissions FROM users WHERE id = $1', [tokenUser.id]);
  const row = result.rows[0];
  if (!row) return null;
  const permissions = Array.isArray(row.permissions) ? row.permissions.filter((value: unknown): value is string => typeof value === 'string') : [];
  return { id: row.id, role: row.role, permissions };
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await loadCurrentUser(req);
    if (!user) { res.status(401).json({ message: 'Authentication required.' }); return; }
    req.user = user;
    next();
  } catch {
    res.status(503).json({ message: 'Authentication temporarily unavailable.' });
  }
}

export function authorize(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await loadCurrentUser(req);
      if (!user) { res.status(401).json({ message: 'Authentication required.' }); return; }
      if (!hasPermission(user, requiredPermission)) { res.status(403).json({ message: 'Access denied.' }); return; }
      req.user = user;
      next();
    } catch {
      res.status(503).json({ message: 'Authentication temporarily unavailable.' });
    }
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
