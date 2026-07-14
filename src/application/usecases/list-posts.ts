import { Post } from '../../domain/post';
import { PostRepository } from '../../domain/post-repository';

export class ListPostsUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(user?: { role: string; id: number }): Promise<Post[]> {
    return this.repository.list(user?.id, user?.role);
  }
}
