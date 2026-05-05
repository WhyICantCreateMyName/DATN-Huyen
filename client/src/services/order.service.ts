import axios from './axios';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

export interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  notes?: string;
  paymentMethod: 'COD' | 'VNPAY';
}

export const orderService = {
  createOrder: (data: CreateOrderData): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.post('/orders', data);
  },

  getOrders: (): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    return axios.get('/orders');
  },

  getOrderDetail: (id: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.get(`/orders/${id}`);
  }
};
