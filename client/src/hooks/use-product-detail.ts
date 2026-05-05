import useSWR from 'swr';
import { productService } from '@/services/product.service';
import { ProductType } from '@/types';

export const useProductDetail = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `product-${id}` : null,
    async () => {
      const result = await productService.getProduct(id);
      return result.data.data as ProductType.Product;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    product: data,
    isLoading,
    isError: error,
    mutate
  };
};
