import axios from './axios';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment: string;
}

export const reviewService = {
  createReview: (data: CreateReviewInput): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.post('/reviews', data);
  },

  getReviewsByProduct: (productId: string): Promise<AxiosResponse<ApiResponse<any[]>>> => {
    return axios.get(`/reviews/product/${productId}`);
  }
};
