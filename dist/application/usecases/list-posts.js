"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListPostsUseCase = void 0;
class ListPostsUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(user) {
        return this.repository.list(user?.id, user?.role);
    }
}
exports.ListPostsUseCase = ListPostsUseCase;
