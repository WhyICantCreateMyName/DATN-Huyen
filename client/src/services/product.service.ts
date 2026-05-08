import axios from './axios';
import { AxiosResponse } from 'axios';
import { ProductType, ApiResponse, QueryParams, PaginatedResponse } from '@/types';

export const productService = {
  getProducts: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<ProductType.Product>>>> => {
    return axios.get('/products', { params });
  },

  getProduct: (idOrSlug: string): Promise<AxiosResponse<ApiResponse<ProductType.Product>>> => {
    return axios.get(`/products/${idOrSlug}`);
  },

  getFeaturedProducts: (): Promise<AxiosResponse<ApiResponse<ProductType.Product[]>>> => {
    return axios.get('/products', { params: { limit: 8, sort: 'newest' } });
  }
};
