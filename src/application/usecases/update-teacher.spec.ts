import { UpdateTeacherUseCase } from './update-teacher';
import { UserRepository } from '../../domain/user-repository';
import { User } from '../../domain/user';

describe('UpdateTeacherUseCase', () => {
  const teacher = new User(2, 'Ana', 'ana@example.com', 'teacher', []);
  const repository = { getById: jest.fn(), findByEmail: jest.fn(), updateTeacher: jest.fn() };
  const usecase = new UpdateTeacherUseCase(repository as unknown as UserRepository);

  beforeEach(() => {
    jest.resetAllMocks();
    repository.getById.mockResolvedValue(teacher);
    repository.findByEmail.mockResolvedValue(null);
    repository.updateTeacher.mockResolvedValue(teacher);
  });

  it('valida e normaliza os dados de um docente', async () => {
    await expect(usecase.execute(2, { name: ' Ana ', email: ' ANA@EXAMPLE.COM ' })).resolves.toBe(teacher);
    expect(repository.updateTeacher).toHaveBeenCalledWith(2, 'Ana', 'ana@example.com');
  });

  it('não atualiza estudantes ou administradores', async () => {
    repository.getById.mockResolvedValue(new User(2, 'Aluno', 'aluno@example.com', 'student', []));
    await expect(usecase.execute(2, { name: 'Aluno', email: 'aluno@example.com' })).rejects.toThrow('Teacher not found.');
    expect(repository.updateTeacher).not.toHaveBeenCalled();
  });

  it('rejeita email duplicado e entradas inválidas', async () => {
    repository.findByEmail.mockResolvedValue(new User(3, 'Outra', 'outra@example.com', 'teacher', []));
    await expect(usecase.execute(2, { name: 'Ana', email: 'outra@example.com' })).rejects.toThrow('Email is already in use.');
    await expect(usecase.execute(2, { name: '', email: 'ana@example.com' })).rejects.toThrow('Name is required.');
    await expect(usecase.execute(2, { name: 'Ana', email: 'inválido' })).rejects.toThrow('A valid email is required.');
    expect(repository.updateTeacher).not.toHaveBeenCalled();
  });

  it('trata conflitos de email detectados pelo banco', async () => {
    repository.updateTeacher.mockRejectedValue({ code: '23505' });
    await expect(usecase.execute(2, { name: 'Ana', email: 'ana@example.com' })).rejects.toThrow('Email is already in use.');
  });
});