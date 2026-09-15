import { useEffect, useMemo, useState } from 'react';
import { listPosts, searchPosts } from '../api/posts';
import { PostCard } from '../components/PostCard';
import { SearchBar } from '../components/SearchBar';
import { PageContainer, ErrorText } from '../components/ui';
import type { Post } from '../types';

export function PostListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const trimmed = query.trim();
        const data = trimmed ? await searchPosts(trimmed) : await listPosts();
        if (active) {
          setPosts(data);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar os posts.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    const timeout = setTimeout(load, 300);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query]);

  const content = useMemo(() => {
    if (loading) return <p>Carregando posts...</p>;
    if (error) return <ErrorText>{error}</ErrorText>;
    if (posts.length === 0) return <p>Nenhum post encontrado.</p>;
    return posts.map((post) => <PostCard key={post.id} post={post} />);
  }, [loading, error, posts]);

  return (
    <PageContainer>
      <h1>Posts</h1>
      <SearchBar value={query} onChange={setQuery} />
      {content}
    </PageContainer>
  );
}
