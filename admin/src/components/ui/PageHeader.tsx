"use client";

import React from "react";
import { LucideIcon, RefreshCw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onRefresh?: () => void;
  refreshLoading?: boolean;
  addButtonText?: string;
  onAdd?: () => void;
  addButtonIcon?: LucideIcon;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  onRefresh,
  refreshLoading,
  addButtonText,
  onAdd,
  addButtonIcon: AddIcon = Plus,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-10 h-10 text-violet-600 dark:text-violet-400" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-zinc-500 dark:text-zinc-400 text-[15px] font-medium ml-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-violet-600 hover:border-violet-500/30 transition-all active:scale-95 shadow-sm group"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={cn(
              "w-5 h-5 transition-transform duration-500 group-hover:rotate-180",
              refreshLoading && "animate-spin"
            )} />
          </button>
        )}

        {onAdd && addButtonText && (
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-violet-200 dark:shadow-none text-[15px]"
          >
            <AddIcon className="w-5 h-5" />
            <span>{addButtonText}</span>
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
