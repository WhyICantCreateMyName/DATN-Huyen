import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { userService } from '@/services/user.service';
import { QueryParams } from '@/types';
import { useDebounce } from './use-debounce';
import { useToast } from '@/contexts/ToastContext';

export const useUser = (params?: QueryParams) => {
  const debouncedSearch = useDebounce(params?.search, 700);

  const { data, error, isLoading, mutate: revalidate } = useSWR(
    ['users', { ...params, search: debouncedSearch }],
    async () => {
      const result = await userService.getUsers({ ...params, search: debouncedSearch });
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

export const useUserActions = () => {
  const { toast } = useToast();

  const { trigger: createUser, isMutating: isCreating } = useSWRMutation(
    'createUser',
    async (_key: string, { arg }: { arg: any }) => {
      try {
        const result = await userService.createUser(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'users');
        toast({
          title: "Thành công",
          message: "Đã tạo tài khoản mới",
          variant: "success"
        });
        return result.data.data;
      } catch (err: any) {
        toast({
          title: "Lỗi",
          message: err.response?.data?.error || "Không thể tạo tài khoản",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: updateUser, isMutating: isUpdating } = useSWRMutation(
    'updateUser',
    async (_key: string, { arg }: { arg: { id: string; data: any } }) => {
      try {
        const result = await userService.updateUser(arg.id, arg.data);
        mutate((key: any) => Array.isArray(key) && key[0] === 'users');
        toast({
          title: "Thành công",
          message: "Đã cập nhật tài khoản",
          variant: "success"
        });
        return result.data.data;
      } catch (err: any) {
        toast({
          title: "Lỗi",
          message: err.response?.data?.error || "Không thể cập nhật tài khoản",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: deleteUser, isMutating: isDeleting } = useSWRMutation(
    'deleteUser',
    async (_key: string, { arg }: { arg: string }) => {
      try {
        await userService.deleteUser(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'users');
        toast({
          title: "Thành công",
          message: "Đã xóa tài khoản",
          variant: "success"
        });
      } catch (err: any) {
        toast({
          title: "Lỗi",
          message: err.response?.data?.error || "Không thể xóa tài khoản",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    deleteUser,
    isDeleting
  };
};
