"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, name, email, role, permissions, createdAt = null, passwordHash = null) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.permissions = permissions;
        this.createdAt = createdAt;
        this.passwordHash = passwordHash;
    }
    toSafeJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            permissions: this.permissions,
            createdAt: this.createdAt,
        };
    }
}
exports.User = User;
