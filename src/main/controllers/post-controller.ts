import { Request, Response } from 'express';
import { CreatePostUseCase } from '../../application/usecases/create-post';
import { GetPostByIdUseCase } from '../../application/usecases/get-post-by-id';
import { ListPostsUseCase } from '../../application/usecases/list-posts';
import { SearchPostsUseCase } from '../../application/usecases/search-posts';
import { UpdatePostUseCase } from '../../application/usecases/update-post';
import { DeletePostUseCase } from '../../application/usecases/delete-post';
import { database } from '../../infra/database';

export class PostController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly updatePostUseCase: UpdatePostUseCase,
    private readonly listPostsUseCase: ListPostsUseCase,
    private readonly getPostByIdUseCase: GetPostByIdUseCase,
    private readonly searchPostsUseCase: SearchPostsUseCase,
    private readonly deletePostUseCase: DeletePostUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = {
        ...req.body,
        createdBy: req.user?.id,
      };

      if (!payload.author?.trim() && req.user?.id) {
        const result = await database.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
        const userName = result.rows[0]?.name;

        if (userName) {
          payload.author = userName;
        }
      }

      const post = await this.createPostUseCase.execute(payload);
      res.status(201).json(post);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(400).json({ message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const payload = {
        ...req.body,
      };

      if (!payload.author?.trim() && req.user?.id) {
        const result = await database.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
        const userName = result.rows[0]?.name;

        if (userName) {
          payload.author = userName;
        }
      }

      const post = await this.updatePostUseCase.execute(id, payload, req.user ? { id: req.user.id, role: req.user.role } : undefined);
      res.status(200).json(post);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(400).json({ message });
    }
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const posts = await this.listPostsUseCase.execute();
      res.status(200).json(posts);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(500).json({ message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const post = await this.getPostByIdUseCase.execute(id);
      res.status(200).json(post);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(404).json({ message });
    }
  };

  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = String(req.query.q || '');
      const posts = await this.searchPostsUseCase.execute(query);
      res.status(200).json(posts);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(500).json({ message });
    }
  };
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.deletePostUseCase.execute(id, req.user ? { id: req.user.id, role: req.user.role } : undefined);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      const statusCode = message === 'Access denied.' ? 403 : 404;
      res.status(statusCode).json({ message });
    }
  };}
