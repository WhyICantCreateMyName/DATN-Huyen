import axios from './axios';
import { AxiosResponse } from 'axios';
import { CategoryType, ApiResponse, QueryParams, PaginatedResponse } from '@/types';

export const categoryService = {
  getCategories: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<CategoryType.Category>>>> => {
    return axios.get('/categories', { params });
  }
};
