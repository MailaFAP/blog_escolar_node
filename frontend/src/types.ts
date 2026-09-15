export type UserRole = 'teacher' | 'student' | 'admin';

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: number | null;
  url?: string | null;
}

export interface CreatePostInput {
  title: string;
  content: string;
  author?: string;
  url?: string;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  author?: string;
}

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}
