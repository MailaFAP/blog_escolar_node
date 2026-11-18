jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
import { api, API_URL } from './client';

describe('exclusão de docente', () => {
  afterEach(() => jest.restoreAllMocks());

  it('envia DELETE autenticado para o docente selecionado', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 204 } as Response);
    await expect(api.deleteTeacher(2)).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/teachers/2`, expect.objectContaining({ method: 'DELETE', credentials: 'include' }));
  });

  it('propaga a recusa da API', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 403, json: async () => ({ message: 'Access denied.' }) } as Response);
    await expect(api.deleteTeacher(2)).rejects.toThrow('Access denied.');
  });
});