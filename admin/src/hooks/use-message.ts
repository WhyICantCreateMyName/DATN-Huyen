import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { messageService } from '@/services/message.service';
import { MessageType, QueryParams, PaginatedResponse } from '@/types';
import { useDebounce } from './use-debounce';

export const useConversation = (params?: QueryParams) => {
  const debouncedSearch = useDebounce(params?.search, 700);

  const { data, error, isLoading, mutate: revalidate } = useSWR(
    ['conversations', { ...params, search: debouncedSearch }],
    async () => {
      const result = await messageService.getConversations();
      // Assuming conversations might eventually be paginated
      return result.status === 200
        ? { data: result.data.data, pagination: { total: result.data.data.length, page: 1, limit: 100, totalPages: 1 } }
        : { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 30000,
    }
  );

  return {
    data: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate: revalidate
  };
};

export const useMessage = (partnerId: string | null) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    partnerId ? `messages_${partnerId}` : null,
    async () => {
      const result = await messageService.getMessages(partnerId!);
      return result.status === 200
        ? { data: result.data.data, pagination: { total: result.data.data.length, page: 1, limit: 100, totalPages: 1 } }
        : { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }
  );

  return {
    data: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate: revalidate
  };
};

import { useToast } from '@/contexts/ToastContext';

export const useMessageActions = (partnerId?: string | null) => {
  const { toast } = useToast();

  const { trigger: sendMessage, isMutating: isSending } = useSWRMutation(
    'sendMessage',
    async (_key: string, { arg }: { arg: string }) => {
      if (!partnerId) return 400;
      try {
        const result = await messageService.sendMessage(partnerId, arg);
        mutate((key: any) => typeof key === 'string' && (key.startsWith('messages_') || key === 'conversations'));
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể gửi tin nhắn",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    sendMessage,
    isSending,
    mutate
  };
};
