"use client";

import React from "react";
import { Edit, Trash2, Tag, Loader2, Package } from "lucide-react";
import { Category } from "@/types/category";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { TableWrapper } from "@/components/ui/TableWrapper";

interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryTable({ categories, isLoading, onEdit, onDelete }: CategoryTableProps) {
  const columns = [
    { label: "Danh mục" },
    { label: "Đường dẫn (Slug)" },
    { label: "Sản phẩm", align: "center" as const },
    { label: "Mô tả" },
    { label: "Thao tác", align: "right" as const },
  ];

  return (
    <TableWrapper
      isLoading={isLoading}
      isEmpty={categories.length === 0}
      emptyIcon={Tag}
      emptyTitle="Chưa có danh mục nào"
      loadingText="Đang tải danh mục..."
      columns={columns}
    >
      {categories.map((category) => (
        <tr key={category.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors">
          <td className="px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Tag className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-zinc-900 dark:text-white truncate">
                  {category.name}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  ID: {category.id.slice(0, 8)}
                </p>
              </div>
            </div>
          </td>
          <td className="px-6 py-5">
            <code className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-mono text-[13px] border border-zinc-200 dark:border-zinc-800">
              {category.slug}
            </code>
          </td>
          <td className="px-6 py-5 text-center">
            <div className="inline-flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 min-w-[80px]">
              <span className="text-lg font-black text-zinc-900 dark:text-white">{category._count?.products || 0}</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sản phẩm</span>
            </div>
          </td>
          <td className="px-6 py-5">
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400 line-clamp-1 max-w-[300px]">
              {category.description || "Không có mô tả"}
            </p>
          </td>
          <td className="px-6 py-5 text-right">
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
              <button
                onClick={() => onEdit(category)}
                className="p-2.5 hover:bg-violet-50 dark:hover:bg-violet-500/10 text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl transition-all"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </TableWrapper>
  );
}
