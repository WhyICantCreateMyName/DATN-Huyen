"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

export function Loading({ fullScreen = false, message = "Đang tải dữ liệu...", className }: LoadingProps) {
  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm transition-all duration-300",
      fullScreen ? "fixed inset-0 z-[100] h-screen w-screen" : "w-full py-12",
      className
    )}>
      <div className="relative flex items-center justify-center">
        {/* Decorative outer pulse */}
        <div className="absolute w-16 h-16 bg-violet-500/20 rounded-full animate-ping" />
        {/* Main Spinner */}
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin relative z-10" />
      </div>
      
      {message && (
        <p className="mt-4 text-zinc-500 dark:text-zinc-400 font-medium animate-pulse tracking-wide">
          {message}
        </p>
      )}
    </div>
  );

  return content;
}
