import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { CartType, ApiResponse } from '@/types';

export const cartService = {
  getCart: (): Promise<AxiosResponse<ApiResponse<CartType.Cart>>> => {
    return axios.get('/cart');
  },

  addToCart: (data: CartType.AddToCartInput): Promise<AxiosResponse<ApiResponse<CartType.Cart>>> => {
    return axios.post('/cart', data);
  },

  updateQuantity: (id: string, data: CartType.UpdateCartItemInput): Promise<AxiosResponse<ApiResponse<CartType.Cart>>> => {
    return axios.put(`/cart/${id}`, data);
  },

  removeItem: (id: string): Promise<AxiosResponse<ApiResponse<CartType.Cart>>> => {
    return axios.delete(`/cart/${id}`);
  },

  clearCart: (): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.post('/cart/clear');
  }
};
