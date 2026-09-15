import bcrypt from 'bcryptjs';
import { CreateUserInput, User } from '../../domain/user';
import { UserRepository } from '../../domain/user-repository';

const SALT_ROUNDS = 10;

export class CreateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    this.validate(input);

    const existing = await this.repository.findByEmail(input.email.trim().toLowerCase());
    if (existing) {
      throw new Error('Email is already in use.');
    }

    const permissions = this.getPermissionsForRole(input.role);
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    return this.repository.create({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      permissions,
      passwordHash,
    });
  }

  private validate(input: CreateUserInput): void {
    if (!input.name?.trim()) {
      throw new Error('Name is required.');
    }

    if (!input.email?.trim()) {
      throw new Error('Email is required.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new Error('A valid email is required.');
    }

    if (!input.password || input.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    if (!['teacher', 'student', 'admin'].includes(input.role)) {
      throw new Error('A valid role is required.');
    }
  }

  private getPermissionsForRole(role: CreateUserInput['role']): string[] {
    const permissionsByRole: Record<CreateUserInput['role'], string[]> = {
      teacher: ['create_post', 'edit_post', 'view_post'],
      student: ['view_post'],
      admin: ['create_post', 'edit_post', 'view_post', 'manage_users'],
    };

    return permissionsByRole[role];
  }
}
