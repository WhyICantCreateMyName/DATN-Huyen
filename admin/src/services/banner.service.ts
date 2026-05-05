import axios from './axios';
import { AxiosResponse } from 'axios';
import { BannerType, ApiResponse } from '@/types';

export const bannerService = {
  getAdminBanners: (): Promise<AxiosResponse<ApiResponse<BannerType.BannerSlider[]>>> => {
    return axios.get('/banners/admin');
  },

  createBanner: (data: BannerType.CreateBannerSliderInput): Promise<AxiosResponse<ApiResponse<BannerType.BannerSlider>>> => {
    return axios.post('/banners', data);
  },

  updateBanner: (id: string, data: Partial<BannerType.CreateBannerSliderInput>): Promise<AxiosResponse<ApiResponse<BannerType.BannerSlider>>> => {
    return axios.put(`/banners/${id}`, data);
  },

  deleteBanner: (id: string): Promise<AxiosResponse<ApiResponse<void>>> => {
    return axios.delete(`/banners/${id}`);
  }
};
