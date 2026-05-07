import axiosInstance from './axios';

export const uploadService = {
  /**
   * Upload a single file
   */
  uploadSingle: async (file: File) => {
    const formData = new FormData();
    formData.append('files', file); // Backend expects 'files' array even for single in some controllers
    return axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Upload multiple files
   */
  uploadMultiple: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return axiosInstance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
