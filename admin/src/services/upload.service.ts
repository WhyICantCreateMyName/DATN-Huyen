import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { ApiResponse, UploadType } from '@/types';

export const uploadService = {
  uploadMultiple: (files: File[]): Promise<AxiosResponse<ApiResponse<UploadType.UploadResponse>>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return axios.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadSingle: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);

    const response = await axios.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.files[0];
  }
};
