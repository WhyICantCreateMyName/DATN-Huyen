import axios from './axios';
import { AxiosResponse } from 'axios';
import { BannerType, ApiResponse } from '@/types';

export const bannerService = {
  getBanners: (): Promise<AxiosResponse<ApiResponse<BannerType.BannerSlider[]>>> => {
    return axios.get('/banners');
  }
};
