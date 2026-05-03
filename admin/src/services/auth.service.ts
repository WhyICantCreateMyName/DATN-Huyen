import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { AuthType, ApiResponse } from '@/types';

export const authService = {
  login: (data: AuthType.LoginInput): Promise<AxiosResponse<ApiResponse<AuthType.AuthResponse>>> => {
    return axios.post('/auth/login', data);
  },

  register: (data: AuthType.RegisterInput): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.post('/auth/register', data);
  },

  logout: (): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.post('/auth/logout');
  },

  getCurrentUser: (): Promise<AxiosResponse<ApiResponse<AuthType.User>>> => {
    return axios.get('/auth/me');
  }
};
