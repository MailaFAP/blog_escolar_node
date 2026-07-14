"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePostUseCase = void 0;
class DeletePostUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, user) {
        this.validateId(id);
        const post = await this.repository.getById(id);
        if (!post) {
            throw new Error('Post not found.');
        }
        if (user?.role === 'teacher' && post.createdBy !== user.id) {
            throw new Error('Access denied.');
        }
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw new Error('Post not found.');
        }
    }
    validateId(id) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('A valid post id is required.');
        }
    }
}
exports.DeletePostUseCase = DeletePostUseCase;
