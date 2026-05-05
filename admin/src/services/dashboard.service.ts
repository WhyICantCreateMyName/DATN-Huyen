import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { ApiResponse, DashboardType } from '@/types';

export const dashboardService = {
  getStats: (): Promise<AxiosResponse<ApiResponse<DashboardType.DashboardStats>>> => {
    return axios.get('/admin/dashboard-stats');
  }
};
