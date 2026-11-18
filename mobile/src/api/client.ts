import { Platform } from 'react-native';
import type { Post } from './posts';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000')).replace(/\/$/, '');

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'teacher' | 'student' | 'admin';
  permissions: string[];
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

let sessionGeneration = 0;
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

async function request<T>(path: string, method = 'GET', body?: unknown, protectedRequest = false): Promise<T> {
  const generation = sessionGeneration;
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (response.status === 401 && protectedRequest && generation === sessionGeneration) unauthorizedHandler?.();
    throw new ApiError(data?.message || 'Não foi possível concluir a operação.', response.status);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

export const api = {
  login: async (email: string, password: string) => {
    const user = await request<User>('/auth/login', 'POST', { email, password });
    sessionGeneration += 1;
    return user;
  },
  register: async (input: { name: string; email: string; password: string; role: 'teacher' | 'student' }) => {
    const user = await request<User>('/auth/register', 'POST', input);
    sessionGeneration += 1;
    return user;
  },
  me: () => request<User>('/auth/me'),
  logout: async () => { await request<void>('/auth/logout', 'POST'); sessionGeneration += 1; },
  getPost: (id: number) => request<Post>(`/posts/${id}`),
  createPost: (input: { title: string; content: string; author: string }) => request<Post>('/posts', 'POST', input, true),
  updatePost: (id: number, input: { title: string; content: string; author: string }) => request<Post>(`/posts/${id}`, 'PUT', input, true),
  deletePost: (id: number) => request<void>(`/posts/${id}`, 'DELETE', undefined, true),
  listUsers: () => request<User[]>('/users', 'GET', undefined, true),
  createTeacher: (input: { name: string; email: string; password: string }) => request<User>('/teachers', 'POST', input, true),
  listTeachers: () => request<User[]>('/teachers', 'GET', undefined, true),
  getTeacher: (id: number) => request<User>(`/teachers/${id}`, 'GET', undefined, true),
  updateTeacher: (id: number, input: { name: string; email: string }) => request<User>(`/teachers/${id}`, 'PUT', input, true),
  deleteTeacher: (id: number) => request<void>(`/teachers/${id}`, 'DELETE', undefined, true),
  listStudents: () => request<User[]>('/students', 'GET', undefined, true),
  createStudent: (input: { name: string; email: string; password: string }) => request<User>('/students', 'POST', input, true),
  getStudent: (id: number) => request<User>(`/students/${id}`, 'GET', undefined, true),
  updateStudent: (id: number, input: { name: string; email: string }) => request<User>(`/students/${id}`, 'PUT', input, true),
  deleteStudent: (id: number) => request<void>(`/students/${id}`, 'DELETE', undefined, true),
  createUser: (input: { name: string; email: string; password: string; role: 'teacher' | 'student' }) => request<User>('/users', 'POST', input, true),
};