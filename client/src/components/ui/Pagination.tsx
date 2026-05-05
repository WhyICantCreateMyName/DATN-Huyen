"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + 2);

    if (end - start < 2) {
      start = Math.max(1, end - 2);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "w-12 h-12 rounded-full text-sm font-black transition-all",
              page === p
                ? "bg-slate-950 text-white shadow-xl shadow-black/20"
                : "text-slate-700/80 hover:bg-white/40 hover:text-slate-950"
            )}
          >
            {p < 10 ? `0${p}` : p}
          </button>
        ))}
        
        {totalPages > 3 && page < totalPages - 1 && (
           <>
             <span className="px-2 text-slate-300 font-bold">...</span>
             <button
                onClick={() => onPageChange(totalPages)}
                className="w-12 h-12 rounded-full text-sm font-black text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              >
                {totalPages < 10 ? `0${totalPages}` : totalPages}
              </button>
           </>
        )}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
