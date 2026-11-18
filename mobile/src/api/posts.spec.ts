import { fetchPosts } from './posts';

describe('fetchPosts', () => {
  afterEach(() => jest.restoreAllMocks());

  it('lists posts when the search is empty', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, title: 'Olá', author: 'Ana', content: 'Texto' }],
    } as Response);

    await expect(fetchPosts('http://localhost:3000/', '  ')).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/posts');
  });

  it('encodes a trimmed search query', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    await fetchPosts('http://localhost:3000', ' educação & arte ');
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/posts/search?q=educa%C3%A7%C3%A3o%20%26%20arte');
  });

  it('reports an unsuccessful response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as Response);
    await expect(fetchPosts('http://localhost:3000')).rejects.toThrow();
  });
});