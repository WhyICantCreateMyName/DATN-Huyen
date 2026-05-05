"use client";

import React from "react";
import { ShoppingCart, UserPlus, CreditCard, Star } from "lucide-react";
import { cn } from "@/lib/utils";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ActivityFeedProps {
  activities: {
    id: string;
    user: string;
    action: string;
    time: string;
    type: string;
  }[];
}

const iconMap: Record<string, any> = {
  order: CreditCard,
  customer: UserPlus,
  cart: ShoppingCart,
  review: Star
};

const colorMap: Record<string, string> = {
  order: "bg-violet-500",
  customer: "bg-emerald-500",
  cart: "bg-amber-500",
  review: "bg-rose-500"
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] flex flex-col h-full group hover:border-violet-500/50 transition-all">
      <div className="mb-8">
        <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">Nhịp đập cửa hàng</h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold mt-1 uppercase tracking-wider">Hoạt động thời gian thực</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        {activities.map((item, idx) => (
          <div key={item.id} className="flex gap-4 relative group/item">
            {idx !== activities.length - 1 && (
              <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-zinc-100 dark:bg-zinc-800 group-hover/item:bg-violet-500/20 transition-colors" />
            )}
            
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg relative z-10", colorMap[item.type] || "bg-zinc-500")}>
              {React.createElement(iconMap[item.type] || CreditCard, { className: "w-5 h-5" })}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                <span className="text-violet-600 dark:text-violet-400">{item.user}</span>
                {" "}{item.action}
              </p>
              <p className="text-[11px] font-bold text-zinc-400 uppercase mt-1 tracking-wider">
                {formatDistanceToNow(new Date(item.time), { addSuffix: true, locale: vi })}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="mt-8 py-4 w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-2xl font-black text-sm hover:bg-violet-600 hover:text-white transition-all shadow-sm">
        Xem tất cả hoạt động
      </button>
    </div>
  );
}
