"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, User, MessageCircleMore, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatHistory, useChatActions } from '@/hooks/use-message';
import { useAuth } from '@/contexts/AuthContext';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { messages, isLoading } = useChatHistory();
  const { sendMessage, isSending } = useChatActions();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      // Error handled by hook toast
    }
  };

  const RenderMessage = ({ content, isUser }: { content: string; isUser: boolean }) => {
    // Tách thành các khối dựa trên 2 dấu xuống dòng (đoạn văn)
    const blocks = content.split(/\n\n+/);

    return (
      <div className="space-y-4">
        {blocks.map((block, bIdx) => {
          // Kiểm tra xem khối này có chứa ảnh sản phẩm không
          const hasImage = block.includes('![IMG]');

          if (hasImage) {
            // Trích xuất thông tin từ khối
            const nameMatch = block.match(/\*\*\[(.*?)\]\((.*?)\)\*\*/) || block.match(/^\s*\d*\.?\s*(.*?)\n/m);
            const imageMatch = block.match(/!\[IMG\]\((.*?)\)/);
            const priceMatch = block.match(/- Giá:\s*(.*)/);

            if (nameMatch || imageMatch) {
              const name = nameMatch ? nameMatch[1] : 'Sản phẩm';
              const url = nameMatch && nameMatch[2] ? nameMatch[2] : '#';
              const imageUrl = imageMatch ? imageMatch[1] : '';
              const price = priceMatch ? priceMatch[1] : '';

              return (
                <motion.a
                  key={bIdx}
                  href={url}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: bIdx * 0.1 }}
                  className="block bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-0 overflow-hidden transition-all group/card shadow-sm hover:shadow-md"
                >
                  <div className="flex gap-0">
                    {imageUrl && (
                      <div className="w-24 h-24 bg-slate-100 flex-shrink-0 relative overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={name}
                          className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-3 flex-1 flex flex-col justify-center">
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight group-hover/card:text-accent transition-colors line-clamp-2">
                        {name.replace(/\*\*/g, '')}
                      </h4>
                      {price && (
                        <p className="text-[10px] font-bold text-accent mt-1 uppercase tracking-wider">
                          Giá: {price}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Chi tiết</span>
                        <Send className="w-2 h-2" />
                      </div>
                    </div>
                  </div>
                </motion.a>
              );
            }
          }

          // Render text bình thường cho các khối không phải sản phẩm
          const lines = block.split('\n');
          return (
            <div key={bIdx} className="space-y-1">
              {lines.map((line, lIdx) => {
                const boldParts = line.split(/(\*\*.*?\*\*)/);
                return (
                  <p key={lIdx} className="text-xs font-medium leading-relaxed">
                    {boldParts.map((part, pIdx) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={pIdx} className="font-black text-slate-900">{part.slice(2, -2)}</strong>;
                      }
                      return part;
                    })}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-6 w-[380px] bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 overflow-hidden flex flex-col"
          >
            <div className="bg-slate-900 p-6 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[40px] rounded-full -mr-16 -mt-16" />
              <div className="flex items-center justify-between relative">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
                    <Sparkles className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-widest text-[10px]">Trợ lý Yuki</h3>
                    <p className="text-white/40 text-[10px] font-bold">Sẵn sàng hỗ trợ bạn</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 p-6 h-[400px] overflow-y-auto space-y-4 bg-slate-50/50 scroll-smooth max-h-[45vh]"
            >
              {!user ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tighter text-black mb-2">Bạn chưa đăng nhập</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Đăng nhập để được tư vấn <br />và nhận ưu đãi riêng</p>
                  <a
                    href="/login"
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Đăng nhập ngay
                  </a>
                </div>
              ) : (
                <>
                  {messages.length === 0 && !isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-accent" />
                      </div>
                      <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 max-w-[80%]">
                        <p className="text-xs font-medium text-slate-600 leading-relaxed">
                          Chào {user.name}! Tôi là trợ lý của Yuki Fashion. Bạn đang quan tâm đến sản phẩm nào thế?
                        </p>
                      </div>
                    </div>
                  )}

                  {messages.map((msg: any) => {
                    const isUser = msg.senderId === user.id || msg.senderType === 'USER';
                    return (
                      <div key={msg.id} className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
                        {!isUser && (
                          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-accent" />
                          </div>
                        )}
                        <div className={cn(
                          "p-4 rounded-2xl shadow-sm border max-w-[85%]",
                          isUser
                            ? "bg-slate-900 text-white border-slate-800 rounded-tr-none"
                            : "bg-white text-slate-600 border-slate-100 rounded-tl-none"
                        )}>
                          <RenderMessage content={msg.content} isUser={isUser} />
                          <p className={cn("text-[8px] mt-2 font-bold uppercase tracking-widest", isUser ? "text-white/40" : "text-slate-300")}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {isSending && (
                    <div className="flex flex-row-reverse gap-3 animate-pulse">
                      <div className="bg-slate-800 p-4 rounded-2xl rounded-tr-none border border-slate-700 max-w-[80%] flex items-center gap-2">
                        <Loader2 className="w-3 h-3 text-white/40 animate-spin" />
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Đang gửi...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
              <form
                onSubmit={handleSend}
                className={cn(
                  "flex items-center gap-3 bg-slate-50 p-2 pl-6 rounded-2xl border border-slate-100 focus-within:border-accent transition-all group",
                  !user && "opacity-50 pointer-events-none"
                )}
              >
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={user ? "Nhập câu hỏi của bạn..." : "Đăng nhập để chat"}
                  disabled={!user || isSending}
                  className="flex-1 bg-transparent border-none p-0 text-xs font-bold placeholder:text-slate-300 focus:ring-0 text-black"
                />
                <button
                  type="submit"
                  disabled={!user || isSending || !message.trim()}
                  className="w-10 h-10 bg-slate-900 text-accent rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:scale-100"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all relative overflow-hidden group",
          isOpen ? "bg-slate-900 text-white" : "bg-accent text-black"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageCircleMore className="w-6 h-6" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-accent"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-full" />
        )}
      </motion.button>
    </div>
  );
}
