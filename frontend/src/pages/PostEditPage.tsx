import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostById, updatePost } from '../api/posts';
import { PostForm } from '../components/PostForm';
import { ErrorText, PageContainer } from '../components/ui';
import type { Post } from '../types';

export function PostEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const postId = Number(id);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isInteger(postId)) {
      setError('Post inválido.');
      setLoading(false);
      return;
    }

    let active = true;
    getPostById(postId)
      .then((data) => {
        if (active) setPost(data);
      })
      .catch(() => {
        if (active) setError('Post não encontrado.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [postId]);

  if (loading) {
    return (
      <PageContainer>
        <p>Carregando...</p>
      </PageContainer>
    );
  }

  if (error || !post) {
    return (
      <PageContainer>
        <ErrorText>{error || 'Post não encontrado.'}</ErrorText>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1>Editar postagem</h1>
      <PostForm
        initialValues={post}
        submitLabel="Salvar alterações"
        onSubmit={async (input) => {
          await updatePost(postId, input);
          navigate(`/posts/${postId}`);
        }}
      />
    </PageContainer>
  );
}
