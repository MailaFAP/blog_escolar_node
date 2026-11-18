jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
import { api, ApiError, API_URL, setUnauthorizedHandler } from './client';

describe('autenticação móvel', () => {
  afterEach(() => { setUnauthorizedHandler(null); jest.restoreAllMocks(); });

  it('envia as credenciais para login com suporte à sessão por cookie', async () => {
    const user = { id: 1, name: 'Ana', email: 'ana@example.com', role: 'teacher', permissions: ['create_post', 'edit_post'] };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => user } as Response);
    await expect(api.login('ana@example.com', 'senha123')).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/auth/login`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@example.com', password: 'senha123' }),
    });
  });

  it('expõe o status quando uma sessão protegida é recusada', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: 'Authentication required.' }) } as Response);
    await expect(api.createPost({ title: 'Post', content: 'Texto', author: 'Ana' })).rejects.toMatchObject({ status: 401 });
    await expect(api.me()).rejects.toBeInstanceOf(ApiError);
  });

  it('não confunde um erro de permissão com sessão expirada', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 403, json: async () => ({ message: 'Access denied.' }) } as Response);
    await expect(api.deletePost(1)).rejects.toMatchObject({ status: 403 });
  });

  it('notifica somente falhas de autenticação em operações protegidas', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: 'Authentication required.' }) } as Response);
    await expect(api.login('a@example.com', 'invalid')).rejects.toThrow();
    expect(handler).not.toHaveBeenCalled();
    await expect(api.deletePost(1)).rejects.toThrow();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('ignora respostas antigas depois de um novo login', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    let finishRequest!: (response: Response) => void;
    jest.spyOn(global, 'fetch')
      .mockImplementationOnce(() => new Promise<Response>((resolve) => { finishRequest = resolve; }))
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 1, role: 'teacher' }) } as Response);
    const pending = api.deletePost(1);
    await api.login('a@example.com', 'senha123');
    finishRequest({ ok: false, status: 401, json: async () => ({ message: 'Authentication required.' }) } as Response);
    await expect(pending).rejects.toThrow();
    expect(handler).not.toHaveBeenCalled();
  });
});