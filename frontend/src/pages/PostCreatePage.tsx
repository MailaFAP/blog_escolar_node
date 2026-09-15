import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/posts';
import { PostForm } from '../components/PostForm';
import { PageContainer } from '../components/ui';

export function PostCreatePage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <h1>Nova postagem</h1>
      <PostForm
        submitLabel="Publicar"
        onSubmit={async (input) => {
          const post = await createPost(input);
          navigate(`/posts/${post.id}`);
        }}
      />
    </PageContainer>
  );
}
