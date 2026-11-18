jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

import { api, API_URL } from './client';

describe('edição de docente', () => {
  afterEach(() => jest.restoreAllMocks());

  it('consulta o docente e salva os dados com a sessão', async () => {
    const teacher = { id: 2, name: 'Ana', email: 'ana@example.com', role: 'teacher', permissions: [] };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => teacher } as Response);
    await expect(api.getTeacher(2)).resolves.toEqual(teacher);
    expect(fetchMock).toHaveBeenLastCalledWith(`${API_URL}/teachers/2`, expect.objectContaining({ method: 'GET', credentials: 'include' }));
    await api.updateTeacher(2, { name: 'Ana', email: 'ana@example.com' });
    expect(fetchMock).toHaveBeenLastCalledWith(`${API_URL}/teachers/2`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Ana', email: 'ana@example.com' }),
    });
  });

  it('rejeita conflitos de email', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 409, json: async () => ({ message: 'Email is already in use.' }) } as Response);
    await expect(api.updateTeacher(2, { name: 'Ana', email: 'ana@example.com' })).rejects.toThrow('Email is already in use.');
  });
});