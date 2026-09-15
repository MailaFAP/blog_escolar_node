import { CookieOptions, Request, Response } from 'express';
import { AuthenticateUserUseCase } from '../../application/usecases/authenticate-user';
import { ChangePasswordUseCase } from '../../application/usecases/change-password';
import { CreateUserUseCase } from '../../application/usecases/create-user';
import { AUTH_COOKIE_NAME, signToken } from '../auth/jwt';
import { getAuthenticatedUser } from '../auth/authorization';
import { UserRepository } from '../../domain/user-repository';

const SELF_REGISTRATION_ROLES = ['teacher'];

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 8 * 60 * 60 * 1000,
};

export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly userRepository: UserRepository
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const role = req.body.role;
      if (!SELF_REGISTRATION_ROLES.includes(role)) {
        throw new Error('Self-registration is only allowed for teacher accounts.');
      }

      const user = await this.createUserUseCase.execute({ ...req.body, role });
      const token = signToken({ id: user.id as number, role: user.role, permissions: user.permissions });

      res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
      res.status(201).json(user.toSafeJSON());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(400).json({ message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authenticateUserUseCase.execute(req.body);
      const token = signToken({ id: user.id as number, role: user.role, permissions: user.permissions });

      res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
      res.status(200).json(user.toSafeJSON());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(401).json({ message });
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie(AUTH_COOKIE_NAME, { ...cookieOptions, maxAge: undefined });
    res.status(204).send();
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const authenticated = getAuthenticatedUser(req);
    if (!authenticated) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const user = await this.userRepository.getById(authenticated.id);
    if (!user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    res.status(200).json(user.toSafeJSON());
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    const authenticated = getAuthenticatedUser(req);
    if (!authenticated) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    try {
      await this.changePasswordUseCase.execute({
        userId: authenticated.id,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      });
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      const statusCode = message === 'Current password is incorrect.' ? 401 : 400;
      res.status(statusCode).json({ message });
    }
  };
}
