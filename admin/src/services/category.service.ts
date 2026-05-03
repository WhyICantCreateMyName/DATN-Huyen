import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { CategoryType, ApiResponse, QueryParams, PaginatedResponse } from '@/types';

export const categoryService = {
  getCategories: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<CategoryType.Category>>>> => {
    return axios.get('/categories', { params });
  },

  getCategory: (id: string): Promise<AxiosResponse<ApiResponse<CategoryType.Category>>> => {
    return axios.get(`/categories/${id}`);
  },

  createCategory: (data: CategoryType.CreateCategoryInput): Promise<AxiosResponse<ApiResponse<CategoryType.Category>>> => {
    return axios.post('/categories', data);
  },

  updateCategory: (id: string, data: CategoryType.UpdateCategoryInput): Promise<AxiosResponse<ApiResponse<CategoryType.Category>>> => {
    return axios.put(`/categories/${id}`, data);
  },

  deleteCategory: (id: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.delete(`/categories/${id}`);
  }
};
