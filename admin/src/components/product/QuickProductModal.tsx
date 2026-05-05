"use client";

import React, { useState } from "react";
import { Save, Loader2, Package, Tag, Layers, Ruler } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useProductActions } from "@/hooks/use-product";
import { useCategory } from "@/hooks/use-category";
import { useToast } from "@/contexts/ToastContext";

interface QuickProductModalProps {
  onClose: () => void;
  onSuccess: (variant: any) => void;
  initialName?: string;
  initialSize?: string;
  initialColor?: string;
}

export function QuickProductModal({
  onClose,
  onSuccess,
  initialName = "",
  initialSize = "L",
  initialColor = "Trắng"
}: QuickProductModalProps) {
  const { toast } = useToast();
  const { data: categories } = useCategory();
  const { createProduct } = useProductActions();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialName,
    categoryId: "",
    description: "Sản phẩm được tạo nhanh từ hóa đơn nhập hàng",
    price: 0,
    variants: [
      { size: initialSize, color: initialColor, stock: 0, price: 0 }
    ]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) {
      toast({ title: "Lưu ý", message: "Vui lòng nhập tên và chọn danh mục", variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      const result = await createProduct({
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        variants: formData.variants,
        images: []
      });

      toast({ title: "Thành công", message: "Đã tạo nhanh sản phẩm mới", variant: "success" });

      if (result && result.variants && result.variants.length > 0) {
        const variantWithProductName = {
          ...result.variants[0],
          product: { name: result.name }
        };
        onSuccess(variantWithProductName);
      } else {
        onSuccess(null);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Tạo nhanh sản phẩm mới" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-zinc-500 uppercase flex items-center gap-2">
            <Package className="w-4 h-4" /> Tên sản phẩm
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-medium"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập tên sản phẩm..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-zinc-500 uppercase flex items-center gap-2">
              <Tag className="w-4 h-4" /> Danh mục
            </label>
            <select
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-medium"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              <option value="">Chọn danh mục</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-zinc-500 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4" /> Giá bán gợi ý
            </label>
            <input
              type="number"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-medium"
              value={formData.variants[0].price}
              onChange={(e) => {
                const newVariants = [...formData.variants];
                newVariants[0].price = Number(e.target.value);
                setFormData({ ...formData, variants: newVariants });
              }}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-zinc-500 uppercase flex items-center gap-2">
              <Ruler className="w-4 h-4" /> Size
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-medium"
              value={formData.variants[0].size}
              onChange={(e) => {
                const newVariants = [...formData.variants];
                newVariants[0].size = e.target.value;
                setFormData({ ...formData, variants: newVariants });
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-zinc-500 uppercase flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500" /> Màu sắc
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 outline-none transition-all font-medium"
              value={formData.variants[0].color}
              onChange={(e) => {
                const newVariants = [...formData.variants];
                newVariants[0].color = e.target.value;
                setFormData({ ...formData, variants: newVariants });
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-zinc-500 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Tạo sản phẩm
          </button>
        </div>
      </form>
    </Modal>
  );
}
