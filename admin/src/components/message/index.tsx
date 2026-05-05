"use client";

import React, { useState } from "react";
import MessageSidebar from "./MessageSidebar";
import MessageWindow from "./MessageWindow";
import { useAdminMessages, useConversation } from "@/hooks/use-admin-message";

export function MessageModule() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { conversations, isLoading: isLoadingConversations } = useAdminMessages();
  const { messages, isLoadingMessages, sendMessage } = useConversation(selectedUserId);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-xl shadow-zinc-200/50 dark:shadow-none">
      <MessageSidebar
        conversations={conversations}
        selectedUserId={selectedUserId}
        onSelectUser={handleSelectUser}
        isLoading={isLoadingConversations}
      />
      <MessageWindow
        userId={selectedUserId}
        messages={messages}
        isLoading={isLoadingMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
