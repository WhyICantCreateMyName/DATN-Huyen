"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Tag,
  RefreshCw
} from "lucide-react";
import { useCategory, useCategoryActions } from "@/hooks/use-category";
import { Category } from "@/types/category";
import { Pagination } from "@/components/ui/Pagination";
import { CategoryModal } from "./CategoryModal";
import { CategoryTable } from "./CategoryTable";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function CategoryListModule() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  const { data: categories, pagination, isLoading, mutate } = useCategory({
    page,
    limit,
    search
  });

  const { deleteCategory } = useCategoryActions();

  const handleAdd = () => {
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này không? Các sản phẩm thuộc danh mục này sẽ bị ảnh hưởng.")) {
      try {
        await deleteCategory(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Tag className="w-8 h-8 text-violet-500" />
            Quản lý danh mục
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[15px]">Phân loại sản phẩm để khách hàng dễ dàng tìm kiếm</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => mutate()}
            className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:text-violet-600 transition-all active:scale-95 shadow-sm"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
          </button>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-violet-200 dark:shadow-none text-[15px]"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm danh mục</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục theo tên hoặc slug..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all text-[15px] font-medium shadow-sm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="md:col-span-4">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-[15px] font-bold shadow-sm">
            <Filter className="w-5 h-5" />
            <span>Bộ lọc nâng cao</span>
          </button>
        </div>
      </div>

      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
        <div className="bg-zinc-50/50 dark:bg-zinc-950/50">
          {pagination && (
            <Pagination
              id="categories-list"
              page={page}
              limit={limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        initialData={editingCategory}
        isEdit={!!editingCategory}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
