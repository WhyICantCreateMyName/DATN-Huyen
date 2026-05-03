"use client";

import React, { useEffect, useState } from "react";
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "warning" | "tip";

export interface ToastProps {
  id: string;
  title: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  link?: string;
  linkText?: string;
  onClose: (id: string) => void;
}

const variantStyles = {
  success: {
    container: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-500/30 backdrop-blur-md",
    icon: "text-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
    title: "text-emerald-900 dark:text-emerald-300",
    message: "text-emerald-700 dark:text-emerald-400/80",
    IconComponent: CheckCircle2
  },
  error: {
    container: "bg-red-50 border-red-200 dark:bg-red-950/60 dark:border-red-500/30 backdrop-blur-md",
    icon: "text-red-500",
    iconBg: "bg-red-100 dark:bg-red-500/20",
    title: "text-red-900 dark:text-red-300",
    message: "text-red-700 dark:text-red-400/80",
    IconComponent: AlertCircle
  },
  warning: {
    container: "bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:border-amber-500/30 backdrop-blur-md",
    icon: "text-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-500/20",
    title: "text-amber-900 dark:text-amber-300",
    message: "text-amber-700 dark:text-amber-400/80",
    IconComponent: AlertTriangle
  },
  tip: {
    container: "bg-violet-50 border-violet-200 dark:bg-zinc-950/60 dark:border-violet-500/30 backdrop-blur-md",
    icon: "text-violet-500",
    iconBg: "bg-violet-100 dark:bg-violet-500/20",
    title: "text-violet-900 dark:text-violet-300",
    message: "text-violet-700 dark:text-violet-400/80",
    IconComponent: Info
  }
};

export function Toast({
  id,
  title,
  message,
  variant = "tip",
  duration = 5000,
  link,
  linkText,
  onClose
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const styles = variantStyles[variant];
  const Icon = styles.IconComponent;

  useEffect(() => {
    if (duration === Infinity) return;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={cn(
        "group relative w-80 sm:w-96 mb-3 flex flex-col pointer-events-auto border rounded-2xl shadow-lg transition-all duration-300 ease-out",
        styles.container,
        isExiting ? "opacity-0 scale-95 translate-x-10" : "opacity-100 scale-100 translate-x-0"
      )}
    >
      <div className="flex p-4">
        <div className={cn("flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mr-3", styles.iconBg)}>
          <Icon className={cn("w-6 h-6", styles.icon)} />
        </div>
        
        <div className="flex-1 min-w-0 pr-6">
          <h4 className={cn("text-sm font-bold leading-tight", styles.title)}>{title}</h4>
          <p className={cn("text-xs mt-1 leading-relaxed", styles.message)}>{message}</p>
          
          {link && (
            <Link 
              href={link} 
              className="mt-2 inline-flex items-center text-xs font-semibold text-zinc-900 dark:text-white hover:underline gap-1 group/link"
              onClick={handleClose}
            >
              {linkText || "Chi tiết"}
              <ChevronRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          )}
        </div>

        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-0 left-4 right-4 h-0.5 overflow-hidden rounded-full bg-zinc-200/50 dark:bg-zinc-800/50">
        <div 
          className={cn("h-full transition-all linear", styles.iconBg.replace("bg-", "bg-opacity-100 bg-"))}
          style={{ 
            animation: duration !== Infinity ? `shrink ${duration}ms linear forwards` : 'none',
            backgroundColor: 'currentColor'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
