import { Post } from '../../domain/post';
import { PostRepository } from '../../domain/post-repository';

export class GetPostByIdUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(id: number, user?: { role: string; id: number }): Promise<Post> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('A valid post id is required.');
    }

    const post = await this.repository.getById(id, user?.id, user?.role);

    if (!post) {
      throw new Error('Post not found.');
    }

    return post;
  }
}
