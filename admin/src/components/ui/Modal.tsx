"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  headerActions?: React.ReactNode;
}

export function Modal({ onClose, title, children, size = "md", headerActions }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw] h-[95vh]",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Content */}
      <div className={cn(
        "relative w-full bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500",
        "max-h-[calc(100vh-120px)]",
        sizes[size]
      )}>
        {/* Header - Fixed at top */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-none">{title}</h2>
            {headerActions && (
              <div className="flex items-center pl-6 border-l border-zinc-200 dark:border-zinc-800">
                {headerActions}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all text-zinc-500 hover:text-zinc-900 dark:hover:text-white active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-zinc-50/50 dark:bg-zinc-900/50">
          {children}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d8;
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1aa;
        }
      `}</style>
    </div>
  );
}
