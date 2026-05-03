import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { MessageType, ApiResponse } from '@/types';

export const messageService = {
  getConversations: (): Promise<AxiosResponse<ApiResponse<MessageType.Conversation[]>>> => {
    return axios.get('/messages/conversations');
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
