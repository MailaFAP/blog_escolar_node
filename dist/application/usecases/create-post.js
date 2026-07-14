"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePostUseCase = void 0;
class CreatePostUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        this.validate(input);
        return this.repository.create(input);
    }
    validate(input) {
        if (!input.title?.trim()) {
            throw new Error('Title is required.');
        }
        if (!input.content?.trim()) {
            throw new Error('Content is required.');
        }
        if (!input.author?.trim()) {
            throw new Error('Author is required.');
        }
    }
}
exports.CreatePostUseCase = CreatePostUseCase;
