"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserUseCase = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 10;
class CreateUserUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        this.validate(input);
        const existing = await this.repository.findByEmail(input.email.trim().toLowerCase());
        if (existing) {
            throw new Error('Email is already in use.');
        }
        const permissions = this.getPermissionsForRole(input.role);
        const passwordHash = await bcryptjs_1.default.hash(input.password, SALT_ROUNDS);
        return this.repository.create({
            name: input.name.trim(),
            email: input.email.trim().toLowerCase(),
            role: input.role,
            permissions,
            passwordHash,
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
        if (!input.password || input.password.length < 8) {
            throw new Error('Password must be at least 8 characters long.');
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
