import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { deletePost, listPosts } from '../api/posts';
import { useAuth } from '../auth/AuthContext';
import { Button, Card, ErrorText, PageContainer } from '../components/ui';
import type { Post } from '../types';

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

const Info = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export function AdminPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listPosts();
      setPosts(data);
    } catch {
      setError('Não foi possível carregar os posts.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Teachers manage only their own posts here; admins keep full oversight.
  const visiblePosts = useMemo(
    () => (user?.role === 'teacher' ? posts.filter((post) => post.createdBy === user.id) : posts),
    [posts, user]
  );

  async function handleDelete(id: number) {
    if (!window.confirm('Tem certeza que deseja excluir esta postagem?')) return;

    setDeletingId(id);
    try {
      await deletePost(id);
      setPosts((current) => current.filter((post) => post.id !== id));
    } catch {
      setError('Não foi possível excluir o post.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PageContainer>
      <h1>Administração de postagens</h1>
      {error && <ErrorText>{error}</ErrorText>}
      {loading ? (
        <p>Carregando...</p>
      ) : visiblePosts.length === 0 ? (
        <p>Nenhum post cadastrado.</p>
      ) : (
        visiblePosts.map((post) => (
          <Card key={post.id} style={{ marginBottom: '0.75rem' }}>
            <Row>
              <Info>
                <strong>{post.title}</strong>
                <div>Por {post.author}</div>
              </Info>
              <Actions>
                <Link to={`/posts/${post.id}/edit`}>
                  <Button $variant="secondary" type="button">
                    Editar
                  </Button>
                </Link>
                <Button
                  $variant="danger"
                  type="button"
                  disabled={deletingId === post.id}
                  onClick={() => handleDelete(post.id)}
                >
                  {deletingId === post.id ? 'Excluindo...' : 'Excluir'}
                </Button>
              </Actions>
            </Row>
          </Card>
        ))
      )}
    </PageContainer>
  );
}
