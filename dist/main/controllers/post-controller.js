"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const database_1 = require("../../infra/database");
class PostController {
    constructor(createPostUseCase, updatePostUseCase, listPostsUseCase, getPostByIdUseCase, searchPostsUseCase, deletePostUseCase) {
        this.createPostUseCase = createPostUseCase;
        this.updatePostUseCase = updatePostUseCase;
        this.listPostsUseCase = listPostsUseCase;
        this.getPostByIdUseCase = getPostByIdUseCase;
        this.searchPostsUseCase = searchPostsUseCase;
        this.deletePostUseCase = deletePostUseCase;
        this.create = async (req, res) => {
            try {
                const payload = {
                    ...req.body,
                    createdBy: req.user?.id,
                };
                if (!payload.author?.trim() && req.user?.id) {
                    const result = await database_1.database.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
                    const userName = result.rows[0]?.name;
                    if (userName) {
                        payload.author = userName;
                    }
                }
                const post = await this.createPostUseCase.execute(payload);
                res.status(201).json(post);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unexpected error';
                res.status(400).json({ message });
            }
        };
        this.update = async (req, res) => {
            try {
                const id = Number(req.params.id);
                const payload = {
                    ...req.body,
                };
                if (!payload.author?.trim() && req.user?.id) {
                    const result = await database_1.database.query('SELECT name FROM users WHERE id = $1', [req.user.id]);
                    const userName = result.rows[0]?.name;
                    if (userName) {
                        payload.author = userName;
                    }
                }
                const post = await this.updatePostUseCase.execute(id, payload, req.user ? { id: req.user.id, role: req.user.role } : undefined);
                res.status(200).json(post);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unexpected error';
                res.status(400).json({ message });
            }
        };
        this.list = async (req, res) => {
            try {
                const posts = await this.listPostsUseCase.execute(req.user ? { id: req.user.id, role: req.user.role } : undefined);
                res.status(200).json(posts);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unexpected error';
                res.status(500).json({ message });
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = Number(req.params.id);
                const post = await this.getPostByIdUseCase.execute(id, req.user ? { id: req.user.id, role: req.user.role } : undefined);
                res.status(200).json(post);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unexpected error';
                res.status(404).json({ message });
            }
        };
        this.search = async (req, res) => {
            try {
                const query = String(req.query.q || '');
                const posts = await this.searchPostsUseCase.execute(query, req.user ? { id: req.user.id, role: req.user.role } : undefined);
                res.status(200).json(posts);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unexpected error';
                res.status(500).json({ message });
            }
        };
        this.delete = async (req, res) => {
            try {
                const id = Number(req.params.id);
                await this.deletePostUseCase.execute(id, req.user ? { id: req.user.id, role: req.user.role } : undefined);
                res.status(204).send();
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unexpected error';
                const statusCode = message === 'Access denied.' ? 403 : 404;
                res.status(statusCode).json({ message });
            }
        };
    }
}
exports.PostController = PostController;
