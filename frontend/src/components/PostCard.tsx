import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { Post } from '../types';
import { Card } from './ui';

const Title = styled(Link)`
  font-size: 1.15rem;
  font-weight: 700;
  text-decoration: none;
  color: #1f2933;

  &:hover {
    text-decoration: underline;
  }
`;

const Meta = styled.p`
  margin: 0.25rem 0 0.5rem;
  font-size: 0.85rem;
  color: #616e7c;
`;

const Excerpt = styled.p`
  margin: 0;
  color: #3e4c59;
  line-height: 1.4;
`;

function excerptOf(content: string): string {
  const plain = content.replace(/\s+/g, ' ').trim();
  return plain.length > 160 ? `${plain.slice(0, 160)}…` : plain;
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Card as="article" style={{ marginBottom: '1rem' }}>
      <Title to={`/posts/${post.id}`}>{post.title}</Title>
      <Meta>Por {post.author}</Meta>
      <Excerpt>{excerptOf(post.content)}</Excerpt>
    </Card>
  );
}
