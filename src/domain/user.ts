export type UserRole = 'teacher' | 'student' | 'admin';

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  permissions?: string[];
}

export class User {
  constructor(
    public readonly id: number | null,
    public name: string,
    public email: string,
    public role: UserRole,
    public permissions: string[],
    public readonly createdAt: Date | null = null
  ) {}
}
