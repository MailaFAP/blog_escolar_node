"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListPostsUseCase = void 0;
class ListPostsUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute() {
        return this.repository.list();
    }
}
exports.ListPostsUseCase = ListPostsUseCase;
