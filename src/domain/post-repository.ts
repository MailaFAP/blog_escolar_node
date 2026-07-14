import { CreatePostInput, Post, UpdatePostInput } from './post';

export interface PostRepository {
  create(input: CreatePostInput): Promise<Post>;
  update(id: number, input: UpdatePostInput): Promise<Post | null>;
  delete(id: number): Promise<boolean>;
  list(userId?: number, role?: string): Promise<Post[]>;
  getById(id: number, userId?: number, role?: string): Promise<Post | null>;
  search(query: string, userId?: number, role?: string): Promise<Post[]>;
}
