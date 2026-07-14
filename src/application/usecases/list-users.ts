import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user-repository';

export class ListUsersUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.repository.list();
  }
}
