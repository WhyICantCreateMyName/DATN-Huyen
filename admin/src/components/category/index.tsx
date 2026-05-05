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
import { PageHeader } from "@/components/ui/PageHeader";

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
      <PageHeader
        title="Quản lý danh mục"
        subtitle="Phân loại sản phẩm để khách hàng dễ dàng tìm kiếm"
        icon={Tag}
        onRefresh={() => mutate()}
        refreshLoading={isLoading}
        addButtonText="Thêm danh mục"
        onAdd={handleAdd}
      />

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

      {isModalOpen && (
        <CategoryModal
          initialData={editingCategory}
          isEdit={!!editingCategory}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
