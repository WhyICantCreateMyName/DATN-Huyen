import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { AuthType, ApiResponse, QueryParams, PaginatedResponse } from '@/types';

export const userService = {
  updateProfile: (data: AuthType.UpdateUserInput): Promise<AxiosResponse<ApiResponse<AuthType.User>>> => {
    return axios.put('/auth/me', data);
  },

  getUsers: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<AuthType.User>>>> => {
    return axios.get('/admin/users', { params });
  },

  updateUser: (id: string, role: 'USER' | 'ADMIN'): Promise<AxiosResponse<ApiResponse<AuthType.User>>> => {
    return axios.put(`/admin/users/${id}`, { role });
  },

  deleteUser: (id: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.delete(`/admin/users/${id}`);
  }
};
