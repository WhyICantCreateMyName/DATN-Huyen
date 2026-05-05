import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { customerService } from '@/services/customer.service';
import { QueryParams, PaginatedResponse, CustomerType } from '@/types';
import { useDebounce } from './use-debounce';
import { useToast } from '@/contexts/ToastContext';

export const useCustomer = (params?: QueryParams) => {
  const debouncedSearch = useDebounce(params?.search, 700);

  const { data, error, isLoading, mutate: revalidate } = useSWR(
    ['customers', { ...params, search: debouncedSearch }],
    async () => {
      const result = await customerService.getCustomers({ ...params, search: debouncedSearch });
      return result.data.data;
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

export const useCustomerActions = () => {
  const { toast } = useToast();

  const { trigger: createCustomer, isMutating: isCreating } = useSWRMutation(
    'createCustomer',
    async (_key: string, { arg }: { arg: CustomerType.CreateCustomerInput }) => {
      try {
        const result = await customerService.createCustomer(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'customers');
        toast({
          title: "Thành công",
          message: "Đã thêm khách hàng mới",
          variant: "success"
        });
        return result.data.data;
      } catch (err: any) {
        toast({
          title: "Lỗi",
          message: err.response?.data?.error || "Không thể thêm khách hàng",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: updateCustomer, isMutating: isUpdating } = useSWRMutation(
    'updateCustomer',
    async (_key: string, { arg }: { arg: { id: string; data: CustomerType.UpdateCustomerInput } }) => {
      try {
        const result = await customerService.updateCustomer(arg.id, arg.data);
        mutate((key: any) => Array.isArray(key) && key[0] === 'customers');
        toast({
          title: "Thành công",
          message: "Đã cập nhật thông tin khách hàng",
          variant: "success"
        });
        return result.data.data;
      } catch (err: any) {
        toast({
          title: "Lỗi",
          message: err.response?.data?.error || "Không thể cập nhật khách hàng",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: deleteCustomer, isMutating: isDeleting } = useSWRMutation(
    'deleteCustomer',
    async (_key: string, { arg }: { arg: string }) => {
      try {
        await customerService.deleteCustomer(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'customers');
        toast({
          title: "Thành công",
          message: "Đã xóa khách hàng",
          variant: "success"
        });
      } catch (err: any) {
        toast({
          title: "Lỗi",
          message: err.response?.data?.error || "Không thể xóa khách hàng",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    createCustomer,
    isCreating,
    updateCustomer,
    isUpdating,
    deleteCustomer,
    isDeleting
  };
};
