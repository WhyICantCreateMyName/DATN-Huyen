import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { ProductType, CategoryType, ApiResponse, QueryParams, PaginatedResponse } from '@/types';

export const productService = {
  // Products
  getProducts: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<ProductType.Product>>>> => {
    return axios.get('/products', { params });
  },

  getProduct: (id: string): Promise<AxiosResponse<ApiResponse<ProductType.Product>>> => {
    return axios.get(`/products/${id}`);
  },

  createProduct: (data: ProductType.CreateProductInput): Promise<AxiosResponse<ApiResponse<ProductType.Product>>> => {
    return axios.post('/products', data);
  },

  updateProduct: (id: string, data: ProductType.UpdateProductInput): Promise<AxiosResponse<ApiResponse<ProductType.Product>>> => {
    return axios.put(`/products/${id}`, data);
  },

  deleteProduct: (id: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.delete(`/products/${id}`);
  }
};

