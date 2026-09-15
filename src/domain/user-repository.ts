import { CreateUserInput, User } from './user';

export interface UserRepository {
  create(input: Omit<CreateUserInput, 'password'> & { passwordHash: string }): Promise<User>;
  list(): Promise<User[]>;
  getById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
}
