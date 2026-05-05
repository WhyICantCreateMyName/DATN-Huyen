"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  id: string;
}

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  id
}: PaginationProps) {
  const [jumpPage, setJumpPage] = useState("");

  // Save/Load limit from localStorage
  useEffect(() => {
    const savedLimit = localStorage.getItem(`pagination_limit_${id}`);
    if (savedLimit && parseInt(savedLimit) !== limit) {
      onLimitChange(parseInt(savedLimit));
    }
  }, [id, limit, onLimitChange]);

  const handleLimitChange = (newLimit: number) => {
    localStorage.setItem(`pagination_limit_${id}`, newLimit.toString());
    onLimitChange(newLimit);
    onPageChange(1); // Reset to page 1
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpPage("");
    }
  };

  // Calculate page numbers to show (max 5)
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (total === 0) return null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Hiển thị</span>
        <select
          value={limit}
          onChange={(e) => handleLimitChange(parseInt(e.target.value))}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
        >
          {[10, 20, 50, 100].map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">kết quả / Trang</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "w-10 h-10 rounded-xl text-sm font-medium transition-all",
              page === p
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleJump} className="flex items-center gap-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">Đến trang</span>
        <input
          type="text"
          value={jumpPage}
          onChange={(e) => setJumpPage(e.target.value)}
          className="w-14 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-center text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
        >
          Đi
        </button>
      </form>
    </div>
  );
}
