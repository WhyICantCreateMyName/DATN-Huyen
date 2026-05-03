import useSWR, { SWRConfiguration } from 'swr';
import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

// fetcher returns the full AxiosResponse
const fetcher = (url: string) => axios.get(url);

export function useFetch<T>(url: string | null, config?: SWRConfiguration) {
  // Type useSWR to expect the full AxiosResponse wrapper
  const { data: response, error, mutate, isValidating } = useSWR<AxiosResponse<ApiResponse<T>>>(
    url, 
    fetcher, 
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      ...config,
    }
  );

  // Extract and cast data in the hook
  const data = response?.status === 200 ? (response.data.data as T) : undefined;

  return {
    data,
    isLoading: !error && !response,
    isError: error,
    mutate,
    isValidating,
  };
}


