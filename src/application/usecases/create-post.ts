import { CreatePostInput, Post } from '../../domain/post';
import { PostRepository } from '../../domain/post-repository';

export class CreatePostUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(input: CreatePostInput): Promise<Post> {
    this.validate(input);
    return this.repository.create(input);
  }

  private validate(input: CreatePostInput): void {
    if (!input.title?.trim()) {
      throw new Error('Title is required.');
    }

    if (!input.content?.trim()) {
      throw new Error('Content is required.');
    }

    if (!input.author?.trim()) {
      throw new Error('Author is required.');
    }
  }
}
