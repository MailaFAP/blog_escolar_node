import { AuthenticateUserUseCase } from '../../application/usecases/authenticate-user';
import { ChangePasswordUseCase } from '../../application/usecases/change-password';
import { CreateUserUseCase } from '../../application/usecases/create-user';
import { database } from '../../infra/database';
import { PostgresUserRepository } from '../../infra/postgres/postgres-user-repository';
import { AuthController } from '../controllers/auth-controller';

export function makeAuthController(): AuthController {
  const repository = new PostgresUserRepository(database);
  const authenticateUserUseCase = new AuthenticateUserUseCase(repository);
  const changePasswordUseCase = new ChangePasswordUseCase(repository);
  const createUserUseCase = new CreateUserUseCase(repository);

  return new AuthController(authenticateUserUseCase, changePasswordUseCase, createUserUseCase, repository);
}
