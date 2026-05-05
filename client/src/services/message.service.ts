import axios from './axios';
import { AxiosResponse } from 'axios';
import { MessageType, ApiResponse } from '@/types';

export const messageService = {
  getHistory: (): Promise<AxiosResponse<ApiResponse<MessageType.Message[]>>> => {
    return axios.get('/messages');
  },

  getMessages: (partnerId: string): Promise<AxiosResponse<ApiResponse<MessageType.Message[]>>> => {
    return axios.get(`/messages/${partnerId}`);
  },

  sendMessage: (receiverId: string, content: string): Promise<AxiosResponse<ApiResponse<MessageType.Message>>> => {
    return axios.post('/messages', { receiverId, content });
  },

  markAsRead: (partnerId: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.put(`/messages/${partnerId}/read`);
  }
};
