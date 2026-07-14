import { NextFunction, Request, Response } from 'express';

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
  const userIdHeader = req.headers['x-user-id'];
  const userRoleHeader = req.headers['x-user-role'];

  if (!userIdHeader || !userRoleHeader) {
    return null;
  }

  const userId = Number(userIdHeader);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }

  const role = String(userRoleHeader).toLowerCase();
  const permissions = getPermissionsForRole(role);

  return {
    id: userId,
    role,
    permissions,
  };
}

export function hasPermission(user: AuthenticatedUser, requiredPermission: string): boolean {
  if (user.role === 'admin') {
    return true;
  }

  return user.permissions.includes(requiredPermission);
}

function getPermissionsForRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    teacher: ['create_post', 'edit_post', 'view_post'],
    student: ['view_post'],
    admin: ['create_post', 'edit_post', 'view_post', 'manage_users'],
  };

  return rolePermissions[role] ?? [];
}
