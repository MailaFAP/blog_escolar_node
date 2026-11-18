import { Pool } from 'pg';
import { PostgresUserRepository } from './postgres-user-repository';

describe('exclusão de docente no repositório', () => {
  it('limita o DELETE ao papel de docente', async () => {
    const query = jest.fn().mockResolvedValue({ rowCount: 1 });
    const repository = new PostgresUserRepository({ query } as unknown as Pool);
    await expect(repository.deleteTeacher(2)).resolves.toBe(true);
    expect(query).toHaveBeenCalledWith("DELETE FROM users WHERE id = $1 AND role = 'teacher'", [2]);
  });

  it('informa quando nenhum docente foi removido', async () => {
    const query = jest.fn().mockResolvedValue({ rowCount: 0 });
    const repository = new PostgresUserRepository({ query } as unknown as Pool);
    await expect(repository.deleteTeacher(2)).resolves.toBe(false);
  });
});

describe('persistência de estudantes', () => {
  it('limita edição e exclusão ao papel student', async () => {
    const query = jest.fn().mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rowCount: 0 });
    const repository = new PostgresUserRepository({ query } as unknown as Pool);
    await expect(repository.updateStudent(2, 'Ana', 'ana@example.com')).resolves.toBeNull();
    expect(query.mock.calls[0][0]).toContain("role = 'student'");
    expect(query.mock.calls[0][1]).toEqual(['Ana', 'ana@example.com', 2]);
    await expect(repository.deleteStudent(2)).resolves.toBe(false);
    expect(query).toHaveBeenLastCalledWith("DELETE FROM users WHERE id = $1 AND role = 'student'", [2]);
  });
});