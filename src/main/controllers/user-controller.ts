import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/usecases/create-user';
import { ListUsersUseCase } from '../../application/usecases/list-users';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      res.status(201).json(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(400).json({ message });
    }
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.listUsersUseCase.execute();
      res.status(200).json(users);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(500).json({ message });
    }
  };
}
