"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserUseCase = void 0;
class CreateUserUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        this.validate(input);
        const permissions = this.getPermissionsForRole(input.role);
        return this.repository.create({
            ...input,
            permissions,
        });
    }
    validate(input) {
        if (!input.name?.trim()) {
            throw new Error('Name is required.');
        }
        if (!input.email?.trim()) {
            throw new Error('Email is required.');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
            throw new Error('A valid email is required.');
        }
        if (!['teacher', 'student', 'admin'].includes(input.role)) {
            throw new Error('A valid role is required.');
        }
    }
    getPermissionsForRole(role) {
        const permissionsByRole = {
            teacher: ['create_post', 'edit_post', 'view_post'],
            student: ['view_post'],
            admin: ['create_post', 'edit_post', 'view_post', 'manage_users'],
        };
        return permissionsByRole[role];
    }
}
exports.CreateUserUseCase = CreateUserUseCase;
