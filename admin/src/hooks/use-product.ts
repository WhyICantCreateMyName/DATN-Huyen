import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { productService } from '@/services/product.service';
import { ProductType, QueryParams, PaginatedResponse } from '@/types';
import { useDebounce } from './use-debounce';
import { useToast } from '@/contexts/ToastContext';

export const useProduct = (params?: QueryParams) => {
  const debouncedSearch = useDebounce(params?.search, 700);

  const { data, error, isLoading, mutate: revalidate } = useSWR(
    ['products', { ...params, search: debouncedSearch }],
    async () => {
      const result = await productService.getProducts({ ...params, search: debouncedSearch });
      return result.status === 200
        ? result.data.data as PaginatedResponse<ProductType.Product>
        : { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    data: data?.data || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 },
    isLoading,
    isError: error,
    mutate: revalidate
  };
};

export const useProductActions = () => {
  const { toast } = useToast();

  const { trigger: createProduct, isMutating: isCreating } = useSWRMutation(
    'createProduct',
    async (_key: string, { arg }: { arg: ProductType.CreateProductInput }) => {
      try {
        const result = await productService.createProduct(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'products');
        toast({
          title: "Thành công",
          message: "Đã tạo sản phẩm mới",
          variant: "success"
        });
        return result.data.data;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể tạo sản phẩm",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: updateProduct, isMutating: isUpdating } = useSWRMutation(
    'updateProduct',
    async (_key: string, { arg }: { arg: { id: string; data: ProductType.UpdateProductInput } }) => {
      try {
        const result = await productService.updateProduct(arg.id, arg.data);
        mutate((key: any) => Array.isArray(key) && key[0] === 'products');
        toast({
          title: "Thành công",
          message: "Đã cập nhật sản phẩm",
          variant: "success"
        });
        return result.data.data;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể cập nhật sản phẩm",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: deleteProduct, isMutating: isDeleting } = useSWRMutation(
    'deleteProduct',
    async (_key: string, { arg }: { arg: string }) => {
      try {
        const result = await productService.deleteProduct(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'products');
        toast({
          title: "Thành công",
          message: "Đã xóa sản phẩm",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể xóa sản phẩm",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: indexProducts, isMutating: isIndexing } = useSWRMutation(
    'indexProducts',
    async () => {
      try {
        await productService.indexProducts();
        toast({
          title: "Thành công",
          message: "Đã đồng bộ chỉ mục tìm kiếm AI, trợ lý AI giờ đây có thể tư vấn các sản phẩm mới!",
          variant: "success"
        });
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể đồng bộ AI. Hãy thử lại sau.",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    createProduct,
    isCreating,
    updateProduct,
    isUpdating,
    deleteProduct,
    isDeleting,
    indexProducts,
    isIndexing,
    mutate
  };
};
