import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { collectionService } from '@/services/collection.service';
import { CollectionType, QueryParams, PaginatedResponse } from '@/types';
import { useDebounce } from './use-debounce';
import { useToast } from '@/contexts/ToastContext';

export const useCollection = (params?: QueryParams) => {
  const debouncedSearch = useDebounce(params?.search, 700);

  const { data, error, isLoading, mutate: revalidate } = useSWR(
    ['collections', { ...params, search: debouncedSearch }],
    async () => {
      const result = await collectionService.getCollections({ ...params, search: debouncedSearch });
      return result.status === 200
        ? result.data.data as PaginatedResponse<CollectionType.Collection>
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

export const useCollectionActions = () => {
  const { toast } = useToast();

  const { trigger: createCollection, isMutating: isCreating } = useSWRMutation(
    'createCollection',
    async (_key: string, { arg }: { arg: CollectionType.CreateCollectionInput }) => {
      try {
        const result = await collectionService.createCollection(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'collections');
        toast({
          title: "Thành công",
          message: "Đã tạo bộ sưu tập mới",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể tạo bộ sưu tập",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: updateCollection, isMutating: isUpdating } = useSWRMutation(
    'updateCollection',
    async (_key: string, { arg }: { arg: { id: string; data: CollectionType.UpdateCollectionInput } }) => {
      try {
        const result = await collectionService.updateCollection(arg.id, arg.data);
        mutate((key: any) => Array.isArray(key) && key[0] === 'collections');
        toast({
          title: "Thành công",
          message: "Đã cập nhật bộ sưu tập",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể cập nhật bộ sưu tập",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: deleteCollection, isMutating: isDeleting } = useSWRMutation(
    'deleteCollection',
    async (_key: string, { arg }: { arg: string }) => {
      try {
        const result = await collectionService.deleteCollection(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'collections');
        toast({
          title: "Thành công",
          message: "Đã xóa bộ sưu tập",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể xóa bộ sưu tập",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    createCollection,
    isCreating,
    updateCollection,
    isUpdating,
    deleteCollection,
    isDeleting,
    mutate
  };
};
