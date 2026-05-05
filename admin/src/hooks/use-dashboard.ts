import useSWR from 'swr';
import { dashboardService } from '@/services/dashboard.service';

export const useDashboard = () => {
  const { data, isLoading, error, mutate } = useSWR(
    'dashboard-stats',
    async () => {
      const res = await dashboardService.getStats();
      return res.data.data;
    },
    {
      refreshInterval: 30000 // Refresh every 30s
    }
  );

  return {
    data,
    isLoading,
    error,
    refresh: mutate
  };
};
