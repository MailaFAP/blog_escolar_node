import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  // The backend authenticates via an httpOnly cookie, so credentials must be sent on every request.
  withCredentials: true,
});
