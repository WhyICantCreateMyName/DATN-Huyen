import axiosInstance from './axios';

export const collectionService = {
  getCollections: (params?: any) => {
    return axiosInstance.get('/collections', { params });
  },

  getCollection: (id: string) => {
    return axiosInstance.get(`/collections/${id}`);
  },

  createCollection: (data: any) => {
    return axiosInstance.post('/collections', data);
  },

  updateCollection: (id: string, data: any) => {
    return axiosInstance.put(`/collections/${id}`, data);
  },

  deleteCollection: (id: string) => {
    return axiosInstance.delete(`/collections/${id}`);
  }
};
