import { CreateUserInput, User } from '../../domain/user';
import { UserRepository } from '../../domain/user-repository';

export class CreateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    this.validate(input);

    const permissions = this.getPermissionsForRole(input.role);

    return this.repository.create({
      ...input,
      permissions,
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
