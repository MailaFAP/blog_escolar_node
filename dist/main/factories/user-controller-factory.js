"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeUserController = makeUserController;
const create_user_1 = require("../../application/usecases/create-user");
const list_users_1 = require("../../application/usecases/list-users");
const database_1 = require("../../infra/database");
const postgres_user_repository_1 = require("../../infra/postgres/postgres-user-repository");
const user_controller_1 = require("../controllers/user-controller");
function makeUserController() {
    const repository = new postgres_user_repository_1.PostgresUserRepository(database_1.database);
    const createUserUseCase = new create_user_1.CreateUserUseCase(repository);
    const listUsersUseCase = new list_users_1.ListUsersUseCase(repository);
    return new user_controller_1.UserController(createUserUseCase, listUsersUseCase);
}
