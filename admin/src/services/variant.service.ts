import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { ProductType, ApiResponse, QueryParams, PaginatedResponse } from '@/types';

export const variantService = {
  getVariants: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<ProductType.ProductVariant>>>> => {
    return axios.get('/admin/variants', { params });
  },

  createVariant: (data: ProductType.CreateVariantInput): Promise<AxiosResponse<ApiResponse<ProductType.ProductVariant>>> => {
    return axios.post('/admin/variants', data);
  },

  updateVariant: (id: string, data: ProductType.UpdateVariantInput): Promise<AxiosResponse<ApiResponse<ProductType.ProductVariant>>> => {
    return axios.put(`/admin/variants/${id}`, data);
  },

  deleteVariant: (id: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.delete(`/admin/variants/${id}`);
  }
};
