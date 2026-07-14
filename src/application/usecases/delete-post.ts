import { PostRepository } from '../../domain/post-repository';

export class DeletePostUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(id: number, user?: { role: string; id: number }): Promise<void> {
    this.validateId(id);

    const post = await this.repository.getById(id);

    if (!post) {
      throw new Error('Post not found.');
    }

    if (user?.role === 'teacher' && post.createdBy !== user.id) {
      throw new Error('Access denied.');
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new Error('Post not found.');
    }
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('A valid post id is required.');
    }
  }
}
