import bcrypt from 'bcryptjs';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user-repository';

const LOGIN_ALLOWED_ROLES = ['teacher', 'admin'];

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export class AuthenticateUserUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(input: AuthenticateUserInput): Promise<User> {
    const email = input.email?.trim().toLowerCase();

    if (!email || !input.password) {
      throw new Error('Email and password are required.');
    }

    const user = await this.repository.findByEmail(email);

    // Same generic error for missing user and wrong password to avoid leaking which emails are registered.
    if (!user || !user.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new Error('Invalid email or password.');
    }

    // Posts are publicly readable, so only teacher/admin accounts need to authenticate.
    if (!LOGIN_ALLOWED_ROLES.includes(user.role)) {
      throw new Error('Only teacher accounts can log in.');
    }

    return user;
  }
}
