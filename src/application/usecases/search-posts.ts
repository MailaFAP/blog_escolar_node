import { Post } from '../../domain/post';
import { PostRepository } from '../../domain/post-repository';

export class SearchPostsUseCase {
  constructor(private readonly repository: PostRepository) {}

  async execute(query: string, user?: { role: string; id: number }): Promise<Post[]> {
    const normalizedQuery = query?.trim() ?? '';

    if (!normalizedQuery) {
      return [];
    }

    return this.repository.search(normalizedQuery, user?.id, user?.role);
  }
}
