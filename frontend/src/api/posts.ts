import { apiClient } from './client';
import type { CreatePostInput, Post, UpdatePostInput } from '../types';

export async function listPosts(): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>('/posts');
  return data;
}

export async function searchPosts(query: string): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>('/posts/search', { params: { q: query } });
  return data;
}

export async function getPostById(id: number): Promise<Post> {
  const { data } = await apiClient.get<Post>(`/posts/${id}`);
  return data;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const { data } = await apiClient.post<Post>('/posts', input);
  return data;
}

export async function updatePost(id: number, input: UpdatePostInput): Promise<Post> {
  const { data } = await apiClient.put<Post>(`/posts/${id}`, input);
  return data;
}

export async function deletePost(id: number): Promise<void> {
  await apiClient.delete(`/posts/${id}`);
}
