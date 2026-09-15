"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPostByIdUseCase = void 0;
class GetPostByIdUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error('A valid post id is required.');
        }
        const post = await this.repository.getById(id);
        if (!post) {
            throw new Error('Post not found.');
        }
        return post;
    }
}
exports.GetPostByIdUseCase = GetPostByIdUseCase;
