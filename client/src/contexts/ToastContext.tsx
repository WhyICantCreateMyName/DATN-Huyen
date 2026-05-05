"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastOptions {
  title: string;
  message?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toastContent = (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center pointer-events-none w-full max-w-[500px] gap-4 px-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {mounted && typeof document !== "undefined" && createPortal(toastContent, document.body)}
    </ToastContext.Provider>
  );
}

function Toast({ id, title, message, variant = "info", duration = 5000, onClose }: ToastItem & { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
    error: <AlertCircle className="w-6 h-6 text-rose-600" />,
    info: <Info className="w-6 h-6 text-blue-600" />,
    warning: <Sparkles className="w-6 h-6 text-amber-600" />,
  };

  const variants = {
    success: "bg-emerald-50/90 border-emerald-100 shadow-emerald-200/20",
    error: "bg-rose-50/90 border-rose-100 shadow-rose-200/20",
    info: "bg-blue-50/90 border-blue-100 shadow-blue-200/20",
    warning: "bg-amber-50/90 border-amber-100 shadow-amber-200/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className={cn(
        "pointer-events-auto w-full bg-nude/95 backdrop-blur-2xl border border-white/50 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-start gap-5 relative group overflow-hidden"
      )}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      
      <div className={cn("shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100/50", variants[variant])}>
        {icons[variant]}
      </div>

      <div className="flex-1 min-w-0 pt-1">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">
          {title}
        </h3>
        {message && (
          <p className="text-xs font-bold text-slate-500 leading-relaxed italic opacity-80 line-clamp-2">
            {message}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition-colors group/close"
      >
        <X className="w-4 h-4 text-slate-400 group-hover/close:text-black" />
      </button>

      {/* Progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-black/10"
      />
    </motion.div>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
