import { apiClient } from './client';
import type { AuthenticatedUser, UserRole } from '../types';

export async function register(
  name: string,
  email: string,
  password: string,
  role: Extract<UserRole, 'teacher' | 'student'>
): Promise<AuthenticatedUser> {
  const { data } = await apiClient.post<AuthenticatedUser>('/auth/register', { name, email, password, role });
  return data;
}

export async function login(email: string, password: string): Promise<AuthenticatedUser> {
  const { data } = await apiClient.post<AuthenticatedUser>('/auth/login', { email, password });
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiClient.put('/auth/password', { currentPassword, newPassword });
}

export async function fetchCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const { data } = await apiClient.get<AuthenticatedUser>('/auth/me');
    return data;
  } catch {
    return null;
  }
}
