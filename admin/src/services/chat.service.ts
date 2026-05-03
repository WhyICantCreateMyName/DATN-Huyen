import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { ChatType, ApiResponse } from '@/types';

export const chatService = {
  sendMessage: (data: ChatType.ChatRequest): Promise<AxiosResponse<ApiResponse<ChatType.ChatResponse>>> => {
    return axios.post('/messages', data);
  },

  refreshIndex: (): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.post('/messages/refresh-index');
  }
};
