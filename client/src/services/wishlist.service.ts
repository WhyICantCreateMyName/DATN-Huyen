import axios from './axios';
import { AxiosResponse } from 'axios';
import { ProductType, ApiResponse } from '@/types';

export const wishlistService = {
  getWishlist: (): Promise<AxiosResponse<ApiResponse<ProductType.Product[]>>> => {
    return axios.get('/wishlist');
  },

  toggleWishlist: (productId: string): Promise<AxiosResponse<ApiResponse<null>>> => {
    return axios.post(`/wishlist/${productId}`);
  }
};
