jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
import { api, API_URL } from './client';

describe('administração de estudantes', () => {
  afterEach(() => jest.restoreAllMocks());
  it('envia cadastro, leitura, atualização e exclusão com a sessão', async () => {
    const student = { id: 2, name: 'Ana', email: 'ana@example.com', role: 'student', permissions: [] };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => student } as Response);
    await api.createUser({ name: 'Ana', email: 'ana@example.com', password: 'senha123', role: 'student' });
    expect(fetchMock).toHaveBeenLastCalledWith(`${API_URL}/users`, expect.objectContaining({ method: 'POST', credentials: 'include' }));
    await api.getStudent(2);
    expect(fetchMock).toHaveBeenLastCalledWith(`${API_URL}/students/2`, expect.objectContaining({ method: 'GET', credentials: 'include' }));
    await api.updateStudent(2, { name: 'Ana', email: 'ana@example.com' });
    expect(fetchMock).toHaveBeenLastCalledWith(`${API_URL}/students/2`, expect.objectContaining({ method: 'PUT', body: JSON.stringify({ name: 'Ana', email: 'ana@example.com' }) }));
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204 } as Response);
    await expect(api.deleteStudent(2)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenLastCalledWith(`${API_URL}/students/2`, expect.objectContaining({ method: 'DELETE', credentials: 'include' }));
  });
  it('rejeita exclusão negada', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 403, json: async () => ({ message: 'Access denied.' }) } as Response);
    await expect(api.deleteStudent(2)).rejects.toThrow('Access denied.');
  });
});