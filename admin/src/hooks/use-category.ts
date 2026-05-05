import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { categoryService } from '@/services/category.service';
import { CategoryType, QueryParams, PaginatedResponse } from '@/types';
import { useDebounce } from './use-debounce';

export const useCategory = (params?: QueryParams) => {
  const debouncedSearch = useDebounce(params?.search, 700);

  const { data, error, isLoading, mutate: revalidate } = useSWR(
    ['categories', { ...params, search: debouncedSearch }],
    async () => {
      const result = await categoryService.getCategories({ ...params, search: debouncedSearch });
      return result.status === 200
        ? result.data.data as PaginatedResponse<CategoryType.Category>
        : { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    },
    {
      revalidateOnFocus: false,
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

import { useToast } from '@/contexts/ToastContext';

export const useCategoryActions = () => {
  const { toast } = useToast();

  const { trigger: createCategory, isMutating: isCreating } = useSWRMutation(
    'createCategory',
    async (_key: string, { arg }: { arg: CategoryType.CreateCategoryInput }) => {
      try {
        const result = await categoryService.createCategory(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'categories');
        toast({
          title: "Thành công",
          message: "Đã tạo danh mục mới",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể tạo danh mục",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: updateCategory, isMutating: isUpdating } = useSWRMutation(
    'updateCategory',
    async (_key: string, { arg }: { arg: { id: string; data: CategoryType.UpdateCategoryInput } }) => {
      try {
        const result = await categoryService.updateCategory(arg.id, arg.data);
        mutate((key: any) => Array.isArray(key) && key[0] === 'categories');
        toast({
          title: "Thành công",
          message: "Đã cập nhật danh mục",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể cập nhật danh mục",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: deleteCategory, isMutating: isDeleting } = useSWRMutation(
    'deleteCategory',
    async (_key: string, { arg }: { arg: string }) => {
      try {
        const result = await categoryService.deleteCategory(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'categories');
        toast({
          title: "Thành công",
          message: "Đã xóa danh mục",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể xóa danh mục",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    createCategory,
    isCreating,
    updateCategory,
    isUpdating,
    deleteCategory,
    isDeleting,
    mutate
  };
};
