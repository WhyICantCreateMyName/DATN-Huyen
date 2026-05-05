"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color: string;
}

export default function StatCard({ label, value, change, isPositive, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2.5rem] group hover:border-violet-500/50 transition-all relative overflow-hidden">
      {/* Background Glow */}
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity", color)} />
      
      <div className="flex items-center justify-between relative z-10">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", color)}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className={cn(
            "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm",
            isPositive 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}>
            {isPositive ? "+" : ""}{change}
          </div>
        )}
      </div>

      <div className="mt-6 relative z-10">
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight">{value}</p>
      </div>

      {/* Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800/50 overflow-hidden rounded-full">
        <div className={cn("h-full w-2/3 rounded-full opacity-50", color)} />
      </div>
    </div>
  );
}
