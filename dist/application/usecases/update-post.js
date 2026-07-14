"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePostUseCase = void 0;
class UpdatePostUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, input, user) {
        this.validateId(id);
        this.validate(input);
        const existingPost = await this.repository.getById(id);
        if (!existingPost) {
            throw new Error('Post not found.');
        }
        if (user?.role === 'teacher' && existingPost.createdBy !== user.id) {
            throw new Error('Access denied.');
        }
        const updatedPost = await this.repository.update(id, input);
        if (!updatedPost) {
            throw new Error('Post not found.');
        }
        return updatedPost;
    }
    validateId(id) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('A valid post id is required.');
        }
    }
    validate(input) {
        if (!input.title?.trim() && !input.content?.trim() && !input.author?.trim()) {
            throw new Error('At least one field must be provided to update the post.');
        }
    }
}
exports.UpdatePostUseCase = UpdatePostUseCase;
