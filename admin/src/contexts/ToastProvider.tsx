"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Toast, ToastVariant } from "@/components/ui/Toast";

interface ToastOptions {
  title: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  link?: string;
  linkText?: string;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toastContent = (
    <div className="fixed top-6 right-6 z-[999999] flex flex-col items-end pointer-events-none">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          {...t}
          onClose={removeToast}
        />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {mounted && createPortal(toastContent, document.body)}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
