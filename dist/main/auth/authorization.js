"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
exports.getAuthenticatedUser = getAuthenticatedUser;
exports.hasPermission = hasPermission;
function authorize(requiredPermission) {
    return (req, res, next) => {
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
function getAuthenticatedUser(req) {
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
function hasPermission(user, requiredPermission) {
    if (user.role === 'admin') {
        return true;
    }
    return user.permissions.includes(requiredPermission);
}
function getPermissionsForRole(role) {
    const rolePermissions = {
        teacher: ['create_post', 'edit_post', 'view_post'],
        student: ['view_post'],
        admin: ['create_post', 'edit_post', 'view_post', 'manage_users'],
    };
    return rolePermissions[role] ?? [];
}
