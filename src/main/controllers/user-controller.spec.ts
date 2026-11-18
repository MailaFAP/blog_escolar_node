import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/usecases/create-user';
import { ListUsersUseCase } from '../../application/usecases/list-users';
import { authenticate } from '../auth/authorization';
import { UserRepository } from '../../domain/user-repository';
import { UpdateTeacherUseCase } from '../../application/usecases/update-teacher';
import { UserController } from './user-controller';

describe('cadastro de docentes', () => {
  const execute = jest.fn();
  const controller = new UserController(
    { execute } as unknown as CreateUserUseCase,
    {} as ListUsersUseCase,
    {} as UserRepository,
    {} as UpdateTeacherUseCase
  );
  let response: { status: jest.Mock; json: jest.Mock };

  beforeEach(() => {
    execute.mockReset();
    response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it.each(['teacher', 'admin'])('permite a %s criar somente docentes', async (role) => {
    const safeUser = { id: 2, name: 'Ana', email: 'ana@example.com', role: 'teacher' };
    execute.mockResolvedValue({ toSafeJSON: () => safeUser });
    const request = {
      user: { id: 1, role, permissions: [] },
      body: { name: 'Ana', email: 'ana@example.com', password: 'senha123', role: 'admin', permissions: ['manage_users'] },
    } as unknown as Request;

    await controller.createTeacher(request, response as unknown as Response);

    expect(execute).toHaveBeenCalledWith({ name: 'Ana', email: 'ana@example.com', password: 'senha123', role: 'teacher' });
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith(safeUser);
  });

  it('impede estudantes de cadastrar docentes', async () => {
    const request = { user: { id: 1, role: 'student', permissions: [] }, body: {} } as unknown as Request;
    await controller.createTeacher(request, response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(execute).not.toHaveBeenCalled();
  });

  it('exige autenticação antes de chegar ao cadastro', async () => {
    const request = { cookies: {}, headers: {} } as Request;
    const next = jest.fn();
    await authenticate(request, response as unknown as Response, next);
    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna erros de validação sem criar uma sessão', async () => {
    execute.mockRejectedValue(new Error('Email is already in use.'));
    const request = { user: { id: 1, role: 'teacher', permissions: [] }, body: {} } as unknown as Request;
    await controller.createTeacher(request, response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ message: 'Email is already in use.' });
  });
});

describe('edição de docentes', () => {
  const execute = jest.fn();
  const getById = jest.fn();
  const list = jest.fn();
  const controller = new UserController(
    {} as CreateUserUseCase,
    { execute: list } as unknown as ListUsersUseCase,
    { getById } as unknown as UserRepository,
    { execute } as unknown as UpdateTeacherUseCase
  );
  let response: { status: jest.Mock; json: jest.Mock };

  beforeEach(() => {
    jest.resetAllMocks();
    response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('recusa estudantes em todas as operações de edição', async () => {
    const request = { user: { role: 'student' }, params: { id: '2' }, body: {} } as unknown as Request;
    await controller.listTeachers(request, response as unknown as Response);
    await controller.getTeacher(request, response as unknown as Response);
    await controller.updateTeacher(request, response as unknown as Response);
    expect(response.status).toHaveBeenCalledTimes(3);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(list).not.toHaveBeenCalled();
    expect(getById).not.toHaveBeenCalled();
    expect(execute).not.toHaveBeenCalled();
  });

  it('entrega somente docentes e sem senha na listagem', async () => {
    list.mockResolvedValue([
      { role: 'teacher', passwordHash: 'secret', toSafeJSON: () => ({ id: 2, role: 'teacher' }) },
      { role: 'student', toSafeJSON: () => ({ id: 3, role: 'student' }) },
    ]);
    await controller.listTeachers({ user: { role: 'teacher' } } as Request, response as unknown as Response);
    expect(response.json).toHaveBeenCalledWith([{ id: 2, role: 'teacher' }]);
  });

  it('ignora campos privilegiados e responde com dados seguros', async () => {
    execute.mockResolvedValue({ toSafeJSON: () => ({ id: 2, role: 'teacher' }) });
    const request = { user: { role: 'teacher' }, params: { id: '2' }, body: { name: 'Ana', email: 'ana@example.com', role: 'admin', password: 'new-password', permissions: ['manage_users'] } } as unknown as Request;
    await controller.updateTeacher(request, response as unknown as Response);
    expect(execute).toHaveBeenCalledWith(2, { name: 'Ana', email: 'ana@example.com' });
    expect(response.json).toHaveBeenCalledWith({ id: 2, role: 'teacher' });
  });

  it('não revela usuários que não sejam docentes', async () => {
    getById.mockResolvedValue({ role: 'admin' });
    const request = { user: { role: 'teacher' }, params: { id: '2' } } as unknown as Request;
    await controller.getTeacher(request, response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(404);
  });
});