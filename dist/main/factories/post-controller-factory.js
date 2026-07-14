"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makePostController = makePostController;
const create_post_1 = require("../../application/usecases/create-post");
const get_post_by_id_1 = require("../../application/usecases/get-post-by-id");
const list_posts_1 = require("../../application/usecases/list-posts");
const search_posts_1 = require("../../application/usecases/search-posts");
const update_post_1 = require("../../application/usecases/update-post");
const delete_post_1 = require("../../application/usecases/delete-post");
const database_1 = require("../../infra/database");
const postgres_post_repository_1 = require("../../infra/postgres/postgres-post-repository");
const post_controller_1 = require("../controllers/post-controller");
function makePostController() {
    const repository = new postgres_post_repository_1.PostgresPostRepository(database_1.database);
    const createPostUseCase = new create_post_1.CreatePostUseCase(repository);
    const updatePostUseCase = new update_post_1.UpdatePostUseCase(repository);
    const listPostsUseCase = new list_posts_1.ListPostsUseCase(repository);
    const getPostByIdUseCase = new get_post_by_id_1.GetPostByIdUseCase(repository);
    const searchPostsUseCase = new search_posts_1.SearchPostsUseCase(repository);
    const deletePostUseCase = new delete_post_1.DeletePostUseCase(repository);
    return new post_controller_1.PostController(createPostUseCase, updatePostUseCase, listPostsUseCase, getPostByIdUseCase, searchPostsUseCase, deletePostUseCase);
}
