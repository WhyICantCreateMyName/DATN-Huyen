import useSWR from 'swr';
import { productService } from '@/services/product.service';
import { ProductType } from '@/types';

export const useProductDetail = (idOrSlug: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    idOrSlug ? `product-${idOrSlug}` : null,
    async () => {
      const result = await productService.getProduct(idOrSlug);
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
