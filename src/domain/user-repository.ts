import { CreateUserInput, User } from './user';

export interface UserRepository {
  create(input: Omit<CreateUserInput, 'password'> & { passwordHash: string }): Promise<User>;
  list(): Promise<User[]>;
  getById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
  updateTeacher(id: number, name: string, email: string): Promise<User | null>;
  deleteTeacher(id: number): Promise<boolean>;
  updateStudent(id: number, name: string, email: string): Promise<User | null>;
  deleteStudent(id: number): Promise<boolean>;
}
