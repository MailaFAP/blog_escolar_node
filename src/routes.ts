import express from 'express';
import { makePostController } from './main/factories/post-controller-factory';
import { makeUserController } from './main/factories/user-controller-factory';
import { authorize } from './main/auth/authorization';

const router = express.Router();
const postController = makePostController();
const userController = makeUserController();

router.post('/posts', authorize('create_post'), postController.create);
router.put('/posts/:id', authorize('edit_post'), postController.update);
router.delete('/posts/:id', authorize('edit_post'), postController.delete);
router.get('/posts/search', authorize('view_post'), postController.search);
router.get('/posts', authorize('view_post'), postController.list);
router.get('/posts/:id', authorize('view_post'), postController.getById);

router.post('/users', authorize('manage_users'), userController.create);
router.get('/users', authorize('manage_users'), userController.list);

export default router;
