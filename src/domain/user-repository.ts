import { CreateUserInput, User } from './user';

export interface UserRepository {
  create(input: CreateUserInput): Promise<User>;
  list(): Promise<User[]>;
  getById(id: number): Promise<User | null>;
}
