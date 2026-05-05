"use client";

import React from "react";
import { Loader2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column {
  label: string;
  align?: "left" | "center" | "right";
  className?: string;
}

interface TableWrapperProps {
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingText?: string;
  columns: Column[];
  children: React.ReactNode;
  className?: string;
}

export function TableWrapper({
  isLoading,
  isEmpty,
  emptyIcon: EmptyIcon,
  emptyTitle = "Chưa có dữ liệu nào",
  emptyDescription = "Bắt đầu bằng cách thêm dữ liệu mới vào hệ thống",
  loadingText = "Đang tải dữ liệu...",
  columns,
  children,
  className,
}: TableWrapperProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] py-20 text-center shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
          <p className="text-sm font-bold text-zinc-400 animate-pulse uppercase tracking-widest">
            {loadingText}
          </p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] py-20 text-center shadow-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center">
            {EmptyIcon && <EmptyIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />}
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-zinc-900 dark:text-white">{emptyTitle}</p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">{emptyDescription}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={cn(
                    "px-6 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
