import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getPostById } from '../api/posts';
import { useAuth } from '../auth/AuthContext';
import { PageContainer, Card, ErrorText, Button } from '../components/ui';
import type { Post } from '../types';

interface Comment {
  id: number;
  author: string;
  text: string;
}

const Meta = styled.p`
  color: #616e7c;
  margin-top: -0.5rem;
`;

const Content = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  margin-top: 1.5rem;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
`;

function commentsStorageKey(postId: number): string {
  return `blog_escolar_comments_${postId}`;
}

export function PostReadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const postId = Number(id);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthor, setCommentAuthor] = useState(user?.name ?? '');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (!Number.isInteger(postId)) {
      setError('Post inválido.');
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
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

    const stored = localStorage.getItem(commentsStorageKey(postId));
    setComments(stored ? (JSON.parse(stored) as Comment[]) : []);

    return () => {
      active = false;
    };
  }, [postId]);

  function handleAddComment(event: React.FormEvent) {
    event.preventDefault();
    if (!commentText.trim()) return;

    const next: Comment[] = [
      ...comments,
      { id: Date.now(), author: commentAuthor.trim() || 'Anônimo', text: commentText.trim() },
    ];
    setComments(next);
    localStorage.setItem(commentsStorageKey(postId), JSON.stringify(next));
    setCommentText('');
  }

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
        <Button onClick={() => navigate('/')}>Voltar</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <h1>{post.title}</h1>
      <Meta>Por {post.author}</Meta>
      <Content>{post.content}</Content>

      <Card as="section" style={{ marginTop: '2rem' }}>
        <h2>Comentários</h2>
        <CommentForm onSubmit={handleAddComment}>
          <label htmlFor="comment-author">Seu nome</label>
          <input
            id="comment-author"
            value={commentAuthor}
            onChange={(event) => setCommentAuthor(event.target.value)}
            readOnly={!!user}
            placeholder="Digite seu nome"
          />
          <label htmlFor="comment-text">Comentário</label>
          <textarea
            id="comment-text"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            rows={3}
          />
          <Button type="submit" style={{ alignSelf: 'flex-start' }}>
            Comentar
          </Button>
        </CommentForm>
        {comments.length === 0 ? (
          <p>Nenhum comentário ainda.</p>
        ) : (
          comments.map((comment) => (
            <p key={comment.id}>
              <strong>{comment.author}:</strong> {comment.text}
            </p>
          ))
        )}
      </Card>
    </PageContainer>
  );
}
