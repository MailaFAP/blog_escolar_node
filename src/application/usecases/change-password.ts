import bcrypt from 'bcryptjs';
import { UserRepository } from '../../domain/user-repository';

const SALT_ROUNDS = 10;

export interface ChangePasswordInput {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

export class ChangePasswordUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    if (!input.newPassword || input.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    if (input.newPassword === input.currentPassword) {
      throw new Error('New password must be different from the current password.');
    }

    const user = await this.repository.getById(input.userId);
    if (!user || !user.passwordHash) {
      throw new Error('User not found.');
    }

    const currentPasswordMatches = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!currentPasswordMatches) {
      throw new Error('Current password is incorrect.');
    }

    const newPasswordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await this.repository.updatePassword(input.userId, newPasswordHash);
  }
}
