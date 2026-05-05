import useSWR from 'swr';
import { categoryService } from '@/services/category.service';
import { CategoryType, PaginatedResponse } from '@/types';

export const useCategory = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'categories',
    async () => {
      const result = await categoryService.getCategories();
      return result.data.data as PaginatedResponse<CategoryType.Category>;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Categories don't change often
    }
  );

  return {
    categories: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
};
