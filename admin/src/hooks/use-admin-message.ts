import { useEffect, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { adminMessageService } from '@/services/admin-message.service';
import { MessageType } from '@/types';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminMessages = () => {
  const { data: conversations, isLoading, mutate: mutateConversations } = useSWR(
    'conversations',
    async () => {
      const res = await adminMessageService.getConversations();
      return res.data.data;
    }
  );

  return {
    conversations: conversations || [],
    isLoading,
    refreshConversations: mutateConversations
  };
};

export const useConversation = (userId: string | null) => {
  const { socket } = useSocket();
  const { user: currentUser } = useAuth();

  // Use SWR for messages cache
  const {
    data: messages,
    isLoading: isLoadingMessages,
    mutate: mutateMessages
  } = useSWR(
    userId ? ['messages', userId] : null,
    async () => {
      const res = await adminMessageService.getMessages(userId!);
      return res.data.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10s
    }
  );

  useEffect(() => {
    if (!socket || !userId) return;

    const handleNewMessage = (msg: MessageType.Message) => {
      const isFromCurrentPartner = msg.senderId === userId || msg.receiverId === userId;

      if (isFromCurrentPartner) {
        // Optimistically update the current conversation messages cache
        mutateMessages((prev: MessageType.Message[] | undefined) => {
          if (!prev) return [msg];
          // Check if message already exists to avoid duplicates (e.g. if sent by self)
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        }, false);
      }

      // Always refresh conversations list for snippets/unread
      mutate('conversations');
    };

    socket.on('message', handleNewMessage);
    return () => {
      socket.off('message', handleNewMessage);
    };
  }, [socket, userId, mutateMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!socket || !userId || !currentUser) return;

    const messageData = {
      senderId: currentUser.id,
      receiverId: userId,
      content,
      senderType: MessageType.MessageSenderType.ADMIN
    };

    // Socket.io will handle the actual sending
    socket.emit('message', messageData);
  }, [socket, userId, currentUser]);

  return {
    messages: messages || [],
    isLoadingMessages,
    sendMessage,
    refreshMessages: mutateMessages
  };
};
