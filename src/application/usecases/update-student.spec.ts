import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user-repository';
import { UpdateStudentUseCase } from './update-student';

describe('edição de estudante', () => {
  const student = new User(2, 'Ana', 'ana@example.com', 'student', []);
  const repository = { getById: jest.fn(), findByEmail: jest.fn(), updateStudent: jest.fn() };
  const usecase = new UpdateStudentUseCase(repository as unknown as UserRepository);
  beforeEach(() => { jest.resetAllMocks(); repository.getById.mockResolvedValue(student); repository.findByEmail.mockResolvedValue(null); repository.updateStudent.mockResolvedValue(student); });

  it('normaliza os dados antes de salvar', async () => {
    await expect(usecase.execute(2, { name: ' Ana ', email: ' ANA@EXAMPLE.COM ' })).resolves.toBe(student);
    expect(repository.updateStudent).toHaveBeenCalledWith(2, 'Ana', 'ana@example.com');
  });
  it('não permite editar outros papéis', async () => {
    repository.getById.mockResolvedValue(new User(2, 'Docente', 'd@example.com', 'teacher', []));
    await expect(usecase.execute(2, { name: 'Ana', email: 'ana@example.com' })).rejects.toThrow('Student not found.');
    expect(repository.updateStudent).not.toHaveBeenCalled();
  });
  it('valida campos e detecta emails duplicados', async () => {
    await expect(usecase.execute(0, { name: 'Ana', email: 'ana@example.com' })).rejects.toThrow('A valid student id is required.');
    await expect(usecase.execute(2, { name: '', email: 'ana@example.com' })).rejects.toThrow('Name is required.');
    await expect(usecase.execute(2, { name: 'Ana', email: 'invalido' })).rejects.toThrow('A valid email is required.');
    repository.findByEmail.mockResolvedValue(new User(3, 'Outro', 'outro@example.com', 'student', []));
    await expect(usecase.execute(2, { name: 'Ana', email: 'outro@example.com' })).rejects.toThrow('Email is already in use.');
    expect(repository.updateStudent).not.toHaveBeenCalled();
  });
  it('trata conflitos detectados pelo banco', async () => {
    repository.updateStudent.mockRejectedValue({ code: '23505' });
    await expect(usecase.execute(2, { name: 'Ana', email: 'ana@example.com' })).rejects.toThrow('Email is already in use.');
  });
});