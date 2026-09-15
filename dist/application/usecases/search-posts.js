"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchPostsUseCase = void 0;
class SearchPostsUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(query) {
        const normalizedQuery = query?.trim() ?? '';
        if (!normalizedQuery) {
            return [];
        }
        return this.repository.search(normalizedQuery);
    }
}
exports.SearchPostsUseCase = SearchPostsUseCase;
