"use client";

import React from "react";
import { Search, MessageSquare } from "lucide-react";
import { MessageType } from "@/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface MessageSidebarProps {
  conversations: MessageType.Conversation[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  isLoading: boolean;
}

export default function MessageSidebar({
  conversations,
  selectedUserId,
  onSelectUser,
  isLoading
}: MessageSidebarProps) {
  return (
    <div className="w-full lg:w-80 h-full border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-950/50">
      {/* Header */}
      <div className="p-6">
        <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-4">Tin nhắn</h2>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm cuộc trò chuyện..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-white/50 dark:bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-100 dark:border-zinc-800" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">Chưa có hội thoại nào</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => {
              const isActive = selectedUserId === conv.partner.id;
              const lastMsg = conv.lastMessage;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectUser(conv.partner.id)}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  className={cn(
                    "w-full p-3 rounded-2xl flex items-center gap-3 transition-colors group relative cursor-pointer select-none border border-transparent",
                    isActive 
                      ? "bg-white dark:bg-zinc-900 shadow-sm" 
                      : "hover:bg-white/60 dark:hover:bg-zinc-900/40"
                  )}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 font-black text-lg">
                      {conv.partner.name.slice(0, 1).toUpperCase()}
                    </div>
                    {/* Status Dot (Mockup) */}
                    <div className="absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-50 dark:border-zinc-950 rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={cn(
                        "font-bold truncate text-[15px]",
                        conv.unreadCount > 0 ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-300"
                      )}>
                        {conv.partner.name}
                      </p>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">
                        {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false, locale: vi })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        "text-sm truncate",
                        conv.unreadCount > 0 ? "text-zinc-900 dark:text-white font-bold" : "text-zinc-500 dark:text-zinc-400 font-medium"
                      )}>
                        {lastMsg.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <div className="min-w-5 h-5 px-1.5 bg-violet-600 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-600 rounded-r-full" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
