import { Request, Response } from 'express';
import { database } from '../../infra/database';
import { authenticate, authorize } from './authorization';
import { signToken } from './jwt';

describe('autorização de contas existentes', () => {
  const previousSecret = process.env.JWT_SECRET;
  const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  beforeEach(() => { process.env.JWT_SECRET = 'test-secret'; jest.clearAllMocks(); });
  afterEach(() => { jest.restoreAllMocks(); });
  afterAll(() => { if (previousSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previousSecret; });

  function request(): Request {
    const token = signToken({ id: 2, role: 'teacher', permissions: ['edit_post'] });
    return { cookies: {}, headers: { authorization: `Bearer ${token}` } } as Request;
  }

  it('recusa um token de conta excluída', async () => {
    jest.spyOn(database, 'query').mockResolvedValue({ rows: [] } as never);
    await authenticate(request(), response as unknown as Response, next);
    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('utiliza permissões atuais do banco', async () => {
    jest.spyOn(database, 'query').mockResolvedValue({ rows: [{ id: 2, role: 'student', permissions: ['view_post'] }] } as never);
    await authorize('edit_post')(request(), response as unknown as Response, next);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('falha de forma fechada quando o banco está indisponível', async () => {
    jest.spyOn(database, 'query').mockRejectedValue(new Error('database unavailable') as never);
    await authenticate(request(), response as unknown as Response, next);
    expect(response.status).toHaveBeenCalledWith(503);
    expect(next).not.toHaveBeenCalled();
  });
});