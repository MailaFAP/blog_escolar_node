import express from 'express';
import { makePostController } from './main/factories/post-controller-factory';
import { makeUserController } from './main/factories/user-controller-factory';
import { makeAuthController } from './main/factories/auth-controller-factory';
import { authenticate, authorize } from './main/auth/authorization';

const router = express.Router();
const postController = makePostController();
const userController = makeUserController();
const authController = makeAuthController();

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authController.me);
router.put('/auth/password', authenticate, authController.changePassword);

router.post('/posts', authorize('create_post'), postController.create);
router.put('/posts/:id', authorize('edit_post'), postController.update);
router.delete('/posts/:id', authorize('edit_post'), postController.delete);
router.get('/posts/search', postController.search);
router.get('/posts', postController.list);
router.get('/posts/:id', postController.getById);

router.post('/users', authorize('manage_users'), userController.create);
router.get('/users', authorize('manage_users'), userController.list);

export default router;
