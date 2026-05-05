import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { useToast } from '@/contexts/ToastContext';
import { variantService } from '@/services/variant.service';
import { ProductType, QueryParams, PaginatedResponse } from '@/types';

export interface VariantState {
  id?: string;
  size: string;
  color: string;
  price: string;
  stock: string;
}

export const useVariant = (params?: QueryParams) => {
  const { data, error, isLoading, mutate } = useSWR(
    ['variants', params],
    async () => {
      const result = await variantService.getVariants(params);
      return result.status === 200
        ? result.data.data as PaginatedResponse<ProductType.ProductVariant>
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
    mutate
  };
};

export const useVariantActions = () => {
  const { toast } = useToast();

  const { trigger: createVariant, isMutating: isCreating } = useSWRMutation(
    'createVariant',
    async (_key: string, { arg }: { arg: ProductType.CreateVariantInput }) => {
      try {
        const result = await variantService.createVariant(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'variants');
        toast({
          title: "Thành công",
          message: "Đã tạo biến thể mới",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể tạo biến thể",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: updateVariant, isMutating: isUpdating } = useSWRMutation(
    'updateVariant',
    async (_key: string, { arg }: { arg: { id: string; data: ProductType.UpdateVariantInput } }) => {
      try {
        const result = await variantService.updateVariant(arg.id, arg.data);
        mutate((key: any) => Array.isArray(key) && key[0] === 'variants');
        toast({
          title: "Thành công",
          message: "Đã cập nhật biến thể",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể cập nhật biến thể",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: deleteVariant, isMutating: isDeleting } = useSWRMutation(
    'deleteVariant',
    async (_key: string, { arg }: { arg: string }) => {
      try {
        const result = await variantService.deleteVariant(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'variants');
        toast({
          title: "Thành công",
          message: "Đã xóa biến thể",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể xóa biến thể",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    createVariant,
    isCreating,
    updateVariant,
    isUpdating,
    deleteVariant,
    isDeleting,
    mutate
  };
};

export function useVariantForm(initialVariants: VariantState[] = [{ size: "", color: "", price: "", stock: "" }]) {
  const [variants, setVariants] = useState<VariantState[]>(initialVariants);
  const { toast } = useToast();

  const addVariant = useCallback(() => {
    setVariants((prev) => [...prev, { size: "", color: "", price: "", stock: "" }]);
  }, []);

  const removeVariant = useCallback((index: number) => {
    setVariants((prev) => {
      if (prev.length === 1) {
        toast({
          title: "Cảnh báo",
          message: "Sản phẩm phải có ít nhất một biến thể",
          variant: "warning",
        });
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
  }, [toast]);

  const updateVariant = useCallback((index: number, field: keyof VariantState, value: string) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }, []);

  const resetVariants = useCallback((newVariants: VariantState[]) => {
    setVariants(newVariants);
  }, []);

  const validateVariants = useCallback(() => {
    return variants.every(v => v.size && v.color && v.price && v.stock);
  }, [variants]);

  return {
    variants,
    addVariant,
    removeVariant,
    updateVariant,
    resetVariants,
    validateVariants,
    setVariants
  };
}
