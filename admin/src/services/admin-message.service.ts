import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { ApiResponse, MessageType } from '@/types';

export const adminMessageService = {
  getConversations: (): Promise<AxiosResponse<ApiResponse<MessageType.Conversation[]>>> => {
    return axios.get('/admin/messages');
  },

  getMessages: (userId: string): Promise<AxiosResponse<ApiResponse<MessageType.Message[]>>> => {
    return axios.get(`/admin/messages/${userId}`);
  },

  sendAiMessage: (data: { content: string; conversationHistory?: any[] }): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.post('/messages', data);
  },

  refreshIndex: (): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.post('/messages/refresh-index');
  }
};
