"use client";

import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Lock,
  Shield,
  Save,
  Loader2
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { AuthType } from "@/types";
import { useUserActions } from "@/hooks/use-user";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface UserModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: AuthType.User;
}

export default function UserModal({ onClose, onSuccess, initialData }: UserModalProps) {
  const { user: currentUser } = useAuth();
  const { createUser, isCreating, updateUser, isUpdating } = useUserActions();

  const isSelf = currentUser?.id === initialData?.id;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setEmail(initialData.email || "");
      setRole(initialData.role || 'USER');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (initialData) {
        await updateUser({
          id: initialData.id,
          data: { name, email, role }
        });
      } else {
        await createUser({
          name,
          email,
          password,
          role
        });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={initialData ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-violet-500" />
              Họ và tên
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none"
              placeholder="Nhập tên người dùng..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-violet-500" />
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none"
              placeholder="email@yuki.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {!initialData && (
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-500" />
                Mật khẩu
              </label>
              <input
                type="password"
                required={!initialData}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-500" />
              Vai trò hệ thống
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'USER', label: 'USER (Nhân viên)', desc: 'Chỉ xem và thao tác cơ bản' },
                { value: 'ADMIN', label: 'ADMIN (Quản trị)', desc: 'Toàn quyền quản trị hệ thống' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isSelf}
                  onClick={() => setRole(opt.value as any)}
                  className={cn(
                    "flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left",
                    role === opt.value
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 ring-4 ring-violet-500/5"
                      : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700",
                    isSelf && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <span className={cn(
                    "font-bold text-sm",
                    role === opt.value ? "text-violet-600 dark:text-violet-400" : "text-zinc-600 dark:text-zinc-400"
                  )}>
                    {opt.label}
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-[15px] font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-8 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all active:scale-95"
          >
            {isCreating || isUpdating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {initialData ? "Cập nhật tài khoản" : "Lưu tài khoản"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
