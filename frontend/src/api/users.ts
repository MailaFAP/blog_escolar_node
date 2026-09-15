import { apiClient } from './client';
import type { AuthenticatedUser, UserRole } from '../types';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export async function listUsers(): Promise<AuthenticatedUser[]> {
  const { data } = await apiClient.get<AuthenticatedUser[]>('/users');
  return data;
}

export async function createUser(input: CreateUserPayload): Promise<AuthenticatedUser> {
  const { data } = await apiClient.post<AuthenticatedUser>('/users', input);
  return data;
}
