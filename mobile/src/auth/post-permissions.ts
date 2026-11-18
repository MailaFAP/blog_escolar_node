import type { User } from '../api/client';
import type { Post } from '../api/posts';

export function canManagePost(user: User | null, post: Post): boolean {
  return user?.role === 'admin' || (user?.role === 'teacher' && post.createdBy != null && post.createdBy === user.id);
}