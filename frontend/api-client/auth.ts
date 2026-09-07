import axiosInstance from './axios';
import { User, AuthResponse } from './types';

export const registerUser = async (data: Partial<User> & { password?: string }): Promise<AuthResponse> => {
  return axiosInstance.post('/api/auth/register', data);
};

export const loginUser = async (credentials: { email?: string; password?: string }): Promise<AuthResponse> => {
  return axiosInstance.post('/api/auth/login', credentials);
};

export const getCurrentUser = async (): Promise<User> => {
  const res: { user?: User } | User = await axiosInstance.get('/api/auth/me');
  return (res as { user?: User })?.user ?? (res as User);
};
