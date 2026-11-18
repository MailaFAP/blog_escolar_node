jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

import { api, API_URL } from './client';

describe('cadastro de docentes', () => {
  afterEach(() => jest.restoreAllMocks());

  it('envia os dados com a sessão autenticada', async () => {
    const input = { name: 'Ana', email: 'ana@example.com', password: 'senha123' };
    const teacher = { id: 2, name: input.name, email: input.email, role: 'teacher', permissions: [] };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 201, json: async () => teacher } as Response);

    await expect(api.createTeacher(input)).resolves.toEqual(teacher);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/teachers`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
    });
  });

  it('informa falha quando a requisição é recusada', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: 'Authentication required.' }) } as Response);
    await expect(api.createTeacher({ name: 'Ana', email: 'ana@example.com', password: 'senha123' })).rejects.toThrow('Authentication required.');
  });
});