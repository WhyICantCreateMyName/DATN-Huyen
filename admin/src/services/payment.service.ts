import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

export const paymentService = {
  createVNPayUrl: (orderId: string): Promise<AxiosResponse<ApiResponse<{ paymentUrl: string; orderId: string; amount: number }>>> => {
    return axios.post('/payment/vnpay/create', { orderId });
  },

  createPayment: (data: { amount: number; orderInfo: string; orderData: any }): Promise<AxiosResponse<ApiResponse<{ paymentUrl: string }>>> => {
    return axios.post('/payment/vnpay/create-payment', data);
  }
};
