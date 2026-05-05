import axios from './axios';
import { AxiosResponse } from 'axios';
import { AuthType, ApiResponse } from '@/types';

export const authService = {
  login: (data: AuthType.LoginInput): Promise<AxiosResponse<ApiResponse<AuthType.AuthResponse>>> => {
    return axios.post('/auth/login', data);
  },

  register: (data: AuthType.RegisterInput): Promise<AxiosResponse<ApiResponse<AuthType.AuthResponse>>> => {
    return axios.post('/auth/register', data);
  },

  getMe: (): Promise<AxiosResponse<ApiResponse<AuthType.User>>> => {
    return axios.get('/auth/me');
  },

  forgotPassword: (email: string): Promise<AxiosResponse<ApiResponse<null>>> => {
    return axios.post('/auth/forgot-password', { email });
  },

  resetPassword: (data: any): Promise<AxiosResponse<ApiResponse<null>>> => {
    return axios.post('/auth/reset-password', data);
  },
  
  updateProfile: (data: { name?: string, phone?: string, address?: string }): Promise<AxiosResponse<ApiResponse<AuthType.User>>> => {
    return axios.patch('/auth/profile', data);
  }
};
