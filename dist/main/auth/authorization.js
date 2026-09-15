"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.getAuthenticatedUser = getAuthenticatedUser;
exports.hasPermission = hasPermission;
const jwt_1 = require("./jwt");
function authenticate(req, res, next) {
    const user = getAuthenticatedUser(req);
    if (!user) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
    }
    req.user = user;
    next();
}
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
    const token = req.cookies?.[jwt_1.AUTH_COOKIE_NAME] || getBearerToken(req);
    if (!token) {
        return null;
    }
    const payload = (0, jwt_1.verifyToken)(token);
    if (!payload) {
        return null;
    }
    return {
        id: payload.id,
        role: payload.role,
        permissions: payload.permissions,
    };
}
function getBearerToken(req) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return null;
    }
    return header.slice('Bearer '.length);
}
function hasPermission(user, requiredPermission) {
    if (user.role === 'admin') {
        return true;
    }
    return user.permissions.includes(requiredPermission);
}
