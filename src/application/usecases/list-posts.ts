import { Post } from '../../domain/post';
import { PostRepository } from '../../domain/post-repository';

export class ListPostsUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(): Promise<Post[]> {
    return this.repository.list();
  }
}
