import useSWR from 'swr';
import { collectionService } from '@/services/collection.service';
import { CollectionType, QueryParams, PaginatedResponse } from '@/types';
import { useDebounce } from './use-debounce';

export const useCollections = (params?: QueryParams) => {
  const debouncedSearch = useDebounce(params?.search, 500);

  const { data, error, isLoading, mutate } = useSWR(
    ['collections', { ...params, search: debouncedSearch }],
    async () => {
      const result = await collectionService.getCollections({ ...params, search: debouncedSearch });
      return result.data.data as PaginatedResponse<CollectionType.Collection>;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    collections: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate
  };
};

export const useCollection = (idOrSlug: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    idOrSlug ? ['collection', idOrSlug] : null,
    async () => {
      const result = await collectionService.getCollection(idOrSlug);
      return result.data.data as CollectionType.Collection;
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    collection: data,
    isLoading,
    isError: error,
    mutate
  };
};
