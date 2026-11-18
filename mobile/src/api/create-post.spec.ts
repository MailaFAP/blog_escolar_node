jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

import { api, API_URL } from './client';

describe('criação de publicação', () => {
  afterEach(() => jest.restoreAllMocks());

  it('envia título, conteúdo e autor com a sessão autenticada', async () => {
    const input = { title: 'Novo post', content: 'Conteúdo completo', author: 'Ana' };
    const post = { id: 1, ...input };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => post,
    } as Response);

    await expect(api.createPost(input)).resolves.toEqual(post);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/posts`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  });

  it('rejeita a criação quando a sessão não está autorizada', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Authentication required.' }),
    } as Response);

    await expect(api.createPost({ title: 'Post', content: 'Texto', author: 'Ana' }))
      .rejects.toThrow('Authentication required.');
  });
});