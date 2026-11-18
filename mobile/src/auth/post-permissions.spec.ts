import { canManagePost } from './post-permissions';
import type { User } from '../api/client';
import type { Post } from '../api/posts';

describe('permissões de administração de posts', () => {
  const post: Post = { id: 1, title: 'Post', content: 'Texto', author: 'Ana', createdBy: 2 };
  const user = (role: User['role'], id: number): User => ({ id, role, name: 'Pessoa', email: 'p@example.com', permissions: [] });

  it('permite ao administrador gerenciar qualquer post', () => {
    expect(canManagePost(user('admin', 3), post)).toBe(true);
    expect(canManagePost(user('admin', 3), { ...post, createdBy: null })).toBe(true);
  });
  it('permite ao docente gerenciar somente posts próprios', () => {
    expect(canManagePost(user('teacher', 2), post)).toBe(true);
    expect(canManagePost(user('teacher', 3), post)).toBe(false);
    expect(canManagePost(user('teacher', 2), { ...post, createdBy: null })).toBe(false);
  });
  it('nega a estudantes e visitantes', () => {
    expect(canManagePost(user('student', 2), post)).toBe(false);
    expect(canManagePost(null, post)).toBe(false);
  });
});