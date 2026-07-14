import { CreateUserUseCase } from '../../application/usecases/create-user';
import { ListUsersUseCase } from '../../application/usecases/list-users';
import { database } from '../../infra/database';
import { PostgresUserRepository } from '../../infra/postgres/postgres-user-repository';
import { UserController } from '../controllers/user-controller';

export function makeUserController(): UserController {
  const repository = new PostgresUserRepository(database);
  const createUserUseCase = new CreateUserUseCase(repository);
  const listUsersUseCase = new ListUsersUseCase(repository);

  return new UserController(createUserUseCase, listUsersUseCase);
}
