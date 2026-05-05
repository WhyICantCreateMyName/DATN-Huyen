import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { messageService } from '@/services/message.service';
import { MessageType } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export const SHOP_ID = 'cb691d24-0bc0-4831-bd01-66d2cbb6c3d1';

export const useChatHistory = () => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    'chat_history',
    async () => {
      const result = await messageService.getHistory();
      return result.status === 200 ? result.data.data : [];
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 5000, // Poll every 5 seconds for new messages
    }
  );

  return {
    messages: data || [],
    isLoading,
    isError: error,
    mutate: revalidate
  };
};

export const useChatActions = () => {
  const { toast } = useToast();

  const { trigger: sendMessage, isMutating: isSending } = useSWRMutation(
    'sendMessage',
    async (_key: string, { arg }: { arg: string }) => {
      try {
        const result = await messageService.sendMessage(SHOP_ID, arg);
        // Optimistically update the chat history
        mutate('chat_history');
        return result.data.data;
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
    isSending
  };
};
