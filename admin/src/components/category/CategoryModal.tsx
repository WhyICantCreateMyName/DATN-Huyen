"use client";

import React, { useState } from "react";
import { Save, Loader2, Info } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useCategoryActions } from "@/hooks/use-category";
import { CategoryType } from "@/types";
import { Modal } from "@/components/ui/Modal";

interface CategoryModalProps {
  onClose: () => void;
  initialData?: CategoryType.Category;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export function CategoryModal({
  onClose,
  initialData,
  isEdit = false,
  onSuccess
}: CategoryModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const { createCategory, updateCategory, isCreating, isUpdating } = useCategoryActions();
  const loading = isCreating || isUpdating;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name) {
      toast({
        title: "Lưu ý",
        message: "Vui lòng nhập tên danh mục",
        variant: "warning"
      });
      return;
    }

    try {
      if (isEdit && initialData?.id) {
        await updateCategory({ id: initialData.id, data: { name, description } });
      } else {
        await createCategory({ name, description });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
    }
  };

  const headerActions = (
    <button
      type="button"
      onClick={() => handleSubmit()}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-violet-500/20"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      <span>{isEdit ? "Lưu thay đổi" : "Lưu danh mục"}</span>
    </button>
  );

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
      size="md"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        <section className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-500/10 rounded-2xl flex items-center justify-center">
              <Info className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Thông tin cơ bản</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400 ml-1">Tên danh mục</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Áo thun nam, Quản Jeans..."
                className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-[15px] font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400 ml-1">Mô tả (tùy chọn)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Mô tả ngắn gọn về danh mục này..."
                className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-[15px] font-medium resize-none"
              />
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}
