"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { MessageType } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface MessageWindowProps {
  userId: string | null;
  messages: MessageType.Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
}

export default function MessageWindow({
  userId,
  messages,
  isLoading,
  onSendMessage
}: MessageWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  if (!userId) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6 text-center">
        <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800">
          <MessageSquare className="w-10 h-10 text-violet-500 opacity-50" />
        </div>
        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Chọn một cuộc trò chuyện</h3>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-sm font-medium">
          Chọn khách hàng từ danh sách bên trái để bắt đầu tư vấn hoặc xem lịch sử tin nhắn.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="px-8 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-violet-600 flex items-center justify-center text-white font-black shadow-lg shadow-violet-500/20">
            {userId.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h3 className="font-black text-zinc-900 dark:text-white leading-tight">Khách hàng #{userId.slice(0, 4)}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Đang hoạt động</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 grayscale">
            <Sparkles className="w-16 h-16 mb-4" />
            <p className="font-bold">Bắt đầu cuộc trò chuyện</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isShop = msg.senderType === MessageType.MessageSenderType.ADMIN || msg.senderType === MessageType.MessageSenderType.BOT;
            const isBot = msg.senderType === MessageType.MessageSenderType.BOT;

            return (
              <div
                key={msg.id || idx}
                className={cn(
                  "flex flex-col",
                  isShop ? "items-end" : "items-start"
                )}
              >
                {/* Bot Tag */}
                {isBot && (
                  <div className="flex items-center gap-1.5 mb-1.5 px-2">
                    <Bot className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest bg-violet-500/10 px-2 py-0.5 rounded-full">
                      Câu trả lời từ trợ lý AI
                    </span>
                  </div>
                )}

                <div className={cn(
                  "max-w-[75%] px-5 py-4 rounded-[1.75rem] shadow-sm relative group",
                  isShop
                    ? "bg-violet-600 text-white rounded-tr-none shadow-violet-500/10"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/50 dark:border-zinc-800"
                )}>
                  <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>

                  <div className={cn(
                    "mt-2 text-[10px] font-bold opacity-60 flex items-center gap-1.5",
                    isShop ? "justify-end" : "justify-start"
                  )}>
                    {format(new Date(msg.createdAt), 'HH:mm', { locale: vi })}
                    {isShop && <div className="w-1 h-1 bg-white/40 rounded-full" />}
                    {isShop && (msg.isRead ? "Đã xem" : "Đã gửi")}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <div className="relative flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 focus-within:ring-4 focus-within:ring-violet-500/10 focus-within:border-violet-500/50 transition-all">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn tư vấn..."
            className="flex-1 bg-transparent border-none outline-none py-3 px-4 text-sm font-medium placeholder:text-zinc-400"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
