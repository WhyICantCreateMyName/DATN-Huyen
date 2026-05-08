import axios from './axios';
import { AxiosResponse } from 'axios';
import { CollectionType, ApiResponse, QueryParams, PaginatedResponse } from '@/types';

export const collectionService = {
  getCollections: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<CollectionType.Collection>>>> => {
    return axios.get('/collections', { params });
  },

  getCollection: (idOrSlug: string): Promise<AxiosResponse<ApiResponse<CollectionType.Collection>>> => {
    return axios.get(`/collections/${idOrSlug}`);
  }
};
