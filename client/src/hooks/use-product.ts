import useSWR from 'swr';
import { productService } from '@/services/product.service';
import { ProductType, QueryParams, PaginatedResponse } from '@/types';
import { useDebounce } from './use-debounce';

export const useProduct = (params?: QueryParams) => {
  const debouncedSearch = useDebounce(params?.search, 500);
  const debouncedMinPrice = useDebounce(params?.minPrice, 500);
  const debouncedMaxPrice = useDebounce(params?.maxPrice, 500);

  const { data, error, isLoading, mutate } = useSWR(
    ['products', { ...params, search: debouncedSearch, minPrice: debouncedMinPrice, maxPrice: debouncedMaxPrice }],
    async () => {
      const result = await productService.getProducts({
        ...params,
        search: debouncedSearch,
        minPrice: debouncedMinPrice,
        maxPrice: debouncedMaxPrice
      });
      return result.data.data as PaginatedResponse<ProductType.Product>;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    products: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate
  };
};
