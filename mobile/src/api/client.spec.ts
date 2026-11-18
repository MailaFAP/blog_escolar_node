jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));

import { api, API_URL } from './client';

describe('leitura de publicação', () => {
  afterEach(() => jest.restoreAllMocks());

  it('busca o post selecionado com seu conteúdo completo', async () => {
    const post = { id: 12, title: 'História', author: 'Ana', content: 'Primeiro parágrafo.\n\nSegundo parágrafo.' };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => post,
    } as Response);

    await expect(api.getPost(12)).resolves.toEqual(post);
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/posts/12`, expect.objectContaining({ method: 'GET' }));
  });

  it('informa falha quando o post não está disponível', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Post not found.' }),
    } as Response);

    await expect(api.getPost(12)).rejects.toThrow('Post not found.');
  });
});