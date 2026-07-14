import { CreatePostUseCase } from '../../application/usecases/create-post';
import { GetPostByIdUseCase } from '../../application/usecases/get-post-by-id';
import { ListPostsUseCase } from '../../application/usecases/list-posts';
import { SearchPostsUseCase } from '../../application/usecases/search-posts';
import { UpdatePostUseCase } from '../../application/usecases/update-post';
import { DeletePostUseCase } from '../../application/usecases/delete-post';
import { database } from '../../infra/database';
import { PostgresPostRepository } from '../../infra/postgres/postgres-post-repository';
import { PostController } from '../controllers/post-controller';

export function makePostController(): PostController {
  const repository = new PostgresPostRepository(database);
  const createPostUseCase = new CreatePostUseCase(repository);
  const updatePostUseCase = new UpdatePostUseCase(repository);
  const listPostsUseCase = new ListPostsUseCase(repository);
  const getPostByIdUseCase = new GetPostByIdUseCase(repository);
  const searchPostsUseCase = new SearchPostsUseCase(repository);
  const deletePostUseCase = new DeletePostUseCase(repository);

  return new PostController(
    createPostUseCase,
    updatePostUseCase,
    listPostsUseCase,
    getPostByIdUseCase,
    searchPostsUseCase,
    deletePostUseCase
  );
}
