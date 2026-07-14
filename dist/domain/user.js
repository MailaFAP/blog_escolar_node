"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, name, email, role, permissions, createdAt = null) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.permissions = permissions;
        this.createdAt = createdAt;
    }
}
exports.User = User;
