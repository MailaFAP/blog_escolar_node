export interface Post {
  id: number;
  title: string;
  author: string;
  content: string;
  createdBy?: number | null;
  createdAt?: string | null;
}

export async function fetchPosts(baseUrl: string, query = ''): Promise<Post[]> {
  const search = query.trim();
  const path = search ? `/posts/search?q=${encodeURIComponent(search)}` : '/posts';
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`);

  if (!response.ok) {
    throw new Error('Não foi possível carregar as publicações.');
  }

  return response.json() as Promise<Post[]>;
}