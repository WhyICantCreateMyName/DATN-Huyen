import { useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { chatService } from '@/services/chat.service';
import { ChatType, MessageType } from '@/types';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatType.Message[]>([]);

  const { trigger: send, isMutating: isSending } = useSWRMutation(
    'chat',
    async (_key: string, { arg }: { arg: string }) => {
      const userMessage: ChatType.Message = { role: 'user', content: arg };
      setMessages((prev) => [...prev, userMessage]);
      const history = messages.slice(-10);

      try {
        const result = await chatService.sendMessage({ message: arg, history });

        if (result.status === 200) {
          const chatData = result.data.data as ChatType.ChatResponse;
          const assistantMessage: ChatType.Message = {
            role: 'assistant',
            content: chatData.response
          };
          setMessages((prev) => [...prev, assistantMessage]);

          return {
            status: result.status,
            data: chatData
          };
        }

        return { status: result.status };
      } catch (err) {
        const errorMessage: ChatType.Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        };
        setMessages((prev) => [...prev, errorMessage]);
        throw err;
      }
    }
  );

  const clearChat = () => setMessages([]);

  return {
    messages,
    send,
    isSending,
    clearChat
  };
};
