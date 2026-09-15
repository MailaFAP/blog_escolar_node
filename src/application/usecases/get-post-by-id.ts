import { Post } from '../../domain/post';
import { PostRepository } from '../../domain/post-repository';

export class GetPostByIdUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(id: number): Promise<Post> {
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('A valid post id is required.');
    }

    const post = await this.repository.getById(id);

    if (!post) {
      throw new Error('Post not found.');
    }

    return post;
  }
}
