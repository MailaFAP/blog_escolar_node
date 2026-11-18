jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

import { api, API_URL } from './client';

describe('edição de publicação', () => {
  afterEach(() => jest.restoreAllMocks());

  it('busca os dados atuais e envia as alterações ao post selecionado', async () => {
    const currentPost = { id: 12, title: 'Título atual', content: 'Texto atual', author: 'Ana' };
    const changes = { title: 'Título atualizado', content: 'Texto atualizado', author: 'Ana' };
    const fetchMock = jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => currentPost } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 12, ...changes }) } as Response);

    await expect(api.getPost(12)).resolves.toEqual(currentPost);
    await expect(api.updatePost(12, changes)).resolves.toEqual({ id: 12, ...changes });
    expect(fetchMock).toHaveBeenLastCalledWith(`${API_URL}/posts/12`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
  });

  it('não trata uma atualização recusada como sucesso', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'Access denied.' }),
    } as Response);

    await expect(api.updatePost(12, { title: 'Título', content: 'Texto', author: 'Ana' }))
      .rejects.toThrow('Access denied.');
  });
});