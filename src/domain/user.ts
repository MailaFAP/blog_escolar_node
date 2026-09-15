export type UserRole = 'teacher' | 'student' | 'admin';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions?: string[];
}

export interface SafeUser {
  id: number | null;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  createdAt: Date | null;
}

export class User {
  constructor(
    public readonly id: number | null,
    public name: string,
    public email: string,
    public role: UserRole,
    public permissions: string[],
    public readonly createdAt: Date | null = null,
    public readonly passwordHash: string | null = null
  ) {}

  toSafeJSON(): SafeUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      permissions: this.permissions,
      createdAt: this.createdAt,
    };
  }
}
