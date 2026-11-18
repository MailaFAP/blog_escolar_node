import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/usecases/create-user';
import { ListUsersUseCase } from '../../application/usecases/list-users';
import { UpdateTeacherUseCase } from '../../application/usecases/update-teacher';
import { UserRepository } from '../../domain/user-repository';
import { UserController } from './user-controller';

describe('exclusão de docente', () => {
  const deleteTeacher = jest.fn();
  const controller = new UserController({} as CreateUserUseCase, {} as ListUsersUseCase, { deleteTeacher } as unknown as UserRepository, {} as UpdateTeacherUseCase);
  let response: { status: jest.Mock; json: jest.Mock; send: jest.Mock };
  beforeEach(() => { jest.resetAllMocks(); response = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() }; });

  it.each(['admin', 'teacher'])('permite a %s excluir um docente', async (role) => {
    deleteTeacher.mockResolvedValue(true);
    await controller.deleteTeacher({ user: { id: 1, role }, params: { id: '2' } } as unknown as Request, response as unknown as Response);
    expect(deleteTeacher).toHaveBeenCalledWith(2);
    expect(response.status).toHaveBeenCalledWith(204);
  });

  it('recusa a exclusão da própria conta', async () => {
    await controller.deleteTeacher({ user: { id: 2, role: 'teacher' }, params: { id: '2' } } as unknown as Request, response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(deleteTeacher).not.toHaveBeenCalled();
  });

  it('recusa exclusão por student', async () => {
    await controller.deleteTeacher({ user: { role: 'student' }, params: { id: '2' } } as unknown as Request, response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(deleteTeacher).not.toHaveBeenCalled();
  });

  it('retorna 404 quando não existe um docente com esse id', async () => {
    deleteTeacher.mockResolvedValue(false);
    await controller.deleteTeacher({ user: { role: 'admin' }, params: { id: '2' } } as unknown as Request, response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(404);
  });

  it('recusa id inválido', async () => {
    await controller.deleteTeacher({ user: { role: 'admin' }, params: { id: 'abc' } } as unknown as Request, response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(deleteTeacher).not.toHaveBeenCalled();
  });
});