import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { userService } from '@/services/user.service';
import { AuthType, QueryParams, PaginatedResponse } from '@/types';
import { useDebounce } from './use-debounce';

export const useUser = (params?: QueryParams) => {
  const debouncedSearch = useDebounce(params?.search, 700);

  const { data, error, isLoading, mutate: revalidate } = useSWR(
    ['users', { ...params, search: debouncedSearch }],
    async () => {
      const result = await userService.getUsers({ ...params, search: debouncedSearch });
      return result.status === 200
        ? result.data.data as PaginatedResponse<AuthType.User>
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

import { useToast } from '@/contexts/ToastProvider';

export const useUserActions = () => {
  const { toast } = useToast();

  const { trigger: updateRole, isMutating: isUpdatingRole } = useSWRMutation(
    'updateUserRole',
    async (_key: string, { arg }: { arg: { id: string; role: 'USER' | 'ADMIN' } }) => {
      try {
        const result = await userService.updateUser(arg.id, arg.role);
        mutate((key: any) => Array.isArray(key) && key[0] === 'users');
        toast({
          title: "Thành công",
          message: "Đã cập nhật quyền người dùng",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể cập nhật quyền người dùng",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: deleteUser, isMutating: isDeletingUser } = useSWRMutation(
    'deleteUser',
    async (_key: string, { arg }: { arg: string }) => {
      try {
        const result = await userService.deleteUser(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'users');
        toast({
          title: "Thành công",
          message: "Đã xóa người dùng",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể xóa người dùng",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: updateProfile, isMutating: isUpdatingProfile } = useSWRMutation(
    'updateProfile',
    async (_key: string, { arg }: { arg: AuthType.UpdateUserInput }) => {
      try {
        const result = await userService.updateProfile(arg);
        mutate('auth_me');
        toast({
          title: "Thành công",
          message: "Đã cập nhật thông tin cá nhân",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể cập nhật thông tin",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    updateRole,
    isUpdatingRole,
    deleteUser,
    isDeletingUser,
    updateProfile,
    isUpdatingProfile,
    mutate
  };
};
