"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListUsersUseCase = void 0;
class ListUsersUseCase {
    constructor(repository) {
        this.repository = repository;
    }
    async execute() {
        return this.repository.list();
    }
}
exports.ListUsersUseCase = ListUsersUseCase;
