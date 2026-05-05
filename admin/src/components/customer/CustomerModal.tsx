"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  Lock
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Customer } from "@/types/customer";
import { useCustomerActions } from "@/hooks/use-customer";
import { cn } from "@/lib/utils";

interface CustomerModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Customer;
}

export default function CustomerModal({ onClose, onSuccess, initialData }: CustomerModalProps) {
  const { createCustomer, isCreating, updateCustomer, isUpdating } = useCustomerActions();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setAddress(initialData.address || "");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (initialData) {
        await updateCustomer({
          id: initialData.id,
          data: { name, email, phone, address }
        });
      } else {
        await createCustomer({
          name,
          email,
          password,
          phone,
          address
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
      title={initialData ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <User className="w-4 h-4 text-violet-500" />
              Họ và tên
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none"
              placeholder="Nhập tên khách hàng..."
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
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
              <Phone className="w-4 h-4 text-violet-500" />
              Số điện thoại
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none"
              placeholder="0123 456 789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {!initialData && (
            <div className="space-y-2">
              <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-500" />
                Mật khẩu (mặc định 123456)
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none"
                placeholder="Để trống nếu muốn dùng mặc định..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-violet-500" />
            Địa chỉ
          </label>
          <textarea
            rows={3}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none resize-none"
            placeholder="Nhập địa chỉ khách hàng..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
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
            {initialData ? "Cập nhật khách hàng" : "Lưu khách hàng"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
