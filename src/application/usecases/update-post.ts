import { Post, UpdatePostInput } from '../../domain/post';
import { PostRepository } from '../../domain/post-repository';

export class UpdatePostUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(id: number, input: UpdatePostInput, user?: { role: string; id: number }): Promise<Post> {
    this.validateId(id);
    this.validate(input);

    const existingPost = await this.repository.getById(id);

    if (!existingPost) {
      throw new Error('Post not found.');
    }

    if (user?.role === 'teacher' && existingPost.createdBy !== user.id) {
      throw new Error('Access denied.');
    }

    const updatedPost = await this.repository.update(id, input);

    if (!updatedPost) {
      throw new Error('Post not found.');
    }

    return updatedPost;
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('A valid post id is required.');
    }
  }

  private validate(input: UpdatePostInput): void {
    if (!input.title?.trim() && !input.content?.trim() && !input.author?.trim()) {
      throw new Error('At least one field must be provided to update the post.');
    }
  }
}
