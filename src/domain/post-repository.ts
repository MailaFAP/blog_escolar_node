import { CreatePostInput, Post, UpdatePostInput } from './post';

export interface PostRepository {
  create(input: CreatePostInput): Promise<Post>;
  update(id: number, input: UpdatePostInput): Promise<Post | null>;
  delete(id: number): Promise<boolean>;
  list(): Promise<Post[]>;
  getById(id: number): Promise<Post | null>;
  search(query: string): Promise<Post[]>;
}
