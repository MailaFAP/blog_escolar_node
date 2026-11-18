import express from 'express';
import type { Server } from 'http';
import { database } from '../../infra/database';
import { signToken } from './jwt';

const createPost = jest.fn((_request, response) => response.status(201).json({ id: 1 }));
const updatePost = jest.fn((_request, response) => response.status(200).json({ id: 1 }));
const deletePost = jest.fn((_request, response) => response.status(204).send());

jest.mock('../factories/post-controller-factory', () => ({
  makePostController: () => ({ create: createPost, update: updatePost, delete: deletePost, list: jest.fn(), search: jest.fn(), getById: jest.fn() }),
}));
jest.mock('../factories/user-controller-factory', () => ({
  makeUserController: () => ({ createTeacher: jest.fn(), listTeachers: jest.fn(), getTeacher: jest.fn(), updateTeacher: jest.fn(), deleteTeacher: jest.fn(), getStudent: jest.fn(), updateStudent: jest.fn(), deleteStudent: jest.fn(), createStudent: jest.fn(), listStudents: jest.fn(), create: jest.fn(), list: jest.fn() }),
}));
jest.mock('../factories/auth-controller-factory', () => ({
  makeAuthController: () => ({ register: jest.fn(), login: jest.fn(), logout: jest.fn(), me: jest.fn(), changePassword: jest.fn() }),
}));

import router from '../../routes';

describe('rotas protegidas de publicações', () => {
  let server: Server;
  let baseUrl: string;
  const previousSecret = process.env.JWT_SECRET;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    const app = express();
    app.use(express.json());
    app.use(router);
    await new Promise<void>((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Unable to start test server.');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });
  afterEach(() => { jest.restoreAllMocks(); jest.clearAllMocks(); });
  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    if (previousSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previousSecret;
  });

  it.each([['POST', '/posts'], ['PUT', '/posts/1'], ['DELETE', '/posts/1']])('recusa %s %s sem sessão', async (method, path) => {
    const response = await fetch(`${baseUrl}${path}`, { method });
    expect(response.status).toBe(401);
    expect(createPost).not.toHaveBeenCalled();
    expect(updatePost).not.toHaveBeenCalled();
    expect(deletePost).not.toHaveBeenCalled();
  });

  it.each([['POST', '/posts'], ['PUT', '/posts/1'], ['DELETE', '/posts/1']])('recusa %s %s para estudantes', async (method, path) => {
    jest.spyOn(database, 'query').mockResolvedValue({ rows: [{ id: 2, role: 'student', permissions: ['view_post'] }] } as never);
    const token = signToken({ id: 2, role: 'student', permissions: ['view_post'] });
    const response = await fetch(`${baseUrl}${path}`, { method, headers: { Authorization: `Bearer ${token}` } });
    expect(response.status).toBe(403);
    expect(createPost).not.toHaveBeenCalled();
    expect(updatePost).not.toHaveBeenCalled();
    expect(deletePost).not.toHaveBeenCalled();
  });

  it('permite que um docente autenticado alcance a criação', async () => {
    jest.spyOn(database, 'query').mockResolvedValue({ rows: [{ id: 2, role: 'teacher', permissions: ['create_post', 'edit_post'] }] } as never);
    const token = signToken({ id: 2, role: 'teacher', permissions: ['create_post', 'edit_post'] });
    const response = await fetch(`${baseUrl}/posts`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    expect(response.status).toBe(201);
    expect(createPost).toHaveBeenCalledTimes(1);
  });
});