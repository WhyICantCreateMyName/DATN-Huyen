import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { Order, OrderStatus, PaymentStatus } from '@/types/order';
import { ApiResponse, QueryParams, PaginatedResponse } from '@/types';

export const orderService = {
  getOrders: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Order>>>> => {
    return axios.get('/orders/admin/list', { params });
  },

  getOrder: (id: string): Promise<AxiosResponse<ApiResponse<Order>>> => {
    return axios.get(`/orders/${id}`);
  },

  updateOrderStatus: (id: string, status: OrderStatus): Promise<AxiosResponse<ApiResponse<Order>>> => {
    return axios.put(`/orders/${id}/status`, { status });
  },

  updatePaymentStatus: (id: string, paymentStatus: PaymentStatus): Promise<AxiosResponse<ApiResponse<Order>>> => {
    return axios.put(`/orders/${id}/payment-status`, { paymentStatus });
  },

  deleteOrder: (id: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.delete(`/orders/${id}`);
  }
};
