import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/usecases/create-user';
import { ListUsersUseCase } from '../../application/usecases/list-users';
import { UpdateTeacherUseCase } from '../../application/usecases/update-teacher';
import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user-repository';
import { UserController } from './user-controller';

describe('administração de estudantes', () => {
  const repository = { getById: jest.fn(), findByEmail: jest.fn(), updateStudent: jest.fn(), deleteStudent: jest.fn() };
  const controller = new UserController({} as CreateUserUseCase, {} as ListUsersUseCase, repository as unknown as UserRepository, {} as UpdateTeacherUseCase);
  let response: { status: jest.Mock; json: jest.Mock; send: jest.Mock };
  beforeEach(() => { jest.resetAllMocks(); response = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() }; });
  const req = (role: string, body: object = {}) => ({ user: { id: 1, role }, params: { id: '2' }, body } as unknown as Request);

  it('recusa operações sem sessão', async () => {
    const anonymous = { params: { id: '2' }, body: {} } as unknown as Request;
    await controller.getStudent(anonymous, response as unknown as Response);
    await controller.updateStudent(anonymous, response as unknown as Response);
    await controller.deleteStudent(anonymous, response as unknown as Response);
    expect(response.status).toHaveBeenCalledTimes(3);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(repository.getById).not.toHaveBeenCalled();
    expect(repository.deleteStudent).not.toHaveBeenCalled();
  });
  it('permite a estudantes excluir outros estudantes, mas não a própria conta', async () => {
    repository.deleteStudent.mockResolvedValue(true);
    await controller.deleteStudent(req('student'), response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(204);
    await controller.deleteStudent({ user: { id: 2, role: 'student' }, params: { id: '2' } } as unknown as Request, response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(repository.deleteStudent).toHaveBeenCalledTimes(1);
  });
  it('atualiza somente nome e email e não retorna senha', async () => {
    const student = new User(2, 'Ana', 'ana@example.com', 'student', [], null, 'hash');
    repository.getById.mockResolvedValue(student);
    repository.findByEmail.mockResolvedValue(null);
    repository.updateStudent.mockResolvedValue(student);
    await controller.updateStudent(req('admin', { name: 'Ana', email: 'ana@example.com', role: 'admin', password: 'alterada' }), response as unknown as Response);
    expect(repository.updateStudent).toHaveBeenCalledWith(2, 'Ana', 'ana@example.com');
    expect(response.json.mock.calls[0][0]).not.toHaveProperty('passwordHash');
  });
  it('não consulta outros papéis como estudante', async () => {
    repository.getById.mockResolvedValue(new User(2, 'Docente', 'd@example.com', 'teacher', []));
    await controller.getStudent(req('admin'), response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(404);
  });
  it('exclui um estudante pelo id e informa quando não existe', async () => {
    repository.deleteStudent.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await controller.deleteStudent(req('admin'), response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(204);
    await controller.deleteStudent(req('admin'), response as unknown as Response);
    expect(response.status).toHaveBeenCalledWith(404);
  });
});