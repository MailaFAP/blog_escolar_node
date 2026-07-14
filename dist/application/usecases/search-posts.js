"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchPostsUseCase = void 0;
class SearchPostsUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(query, user) {
        const normalizedQuery = query?.trim() ?? '';
        if (!normalizedQuery) {
            return [];
        }
        return this.repository.search(normalizedQuery, user?.id, user?.role);
    }
}
exports.SearchPostsUseCase = SearchPostsUseCase;
