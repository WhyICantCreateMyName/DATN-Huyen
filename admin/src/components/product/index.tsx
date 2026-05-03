"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Menu,
  Package
} from "lucide-react";
import { useProduct, useProductActions } from "@/hooks/use-product";
import { useCategory } from "@/hooks/use-category";
import { Product } from "@/types/product";
import { Pagination } from "@/components/ui/Pagination";
import { ProductFormModule } from "./ProductModal";
import { ProductTable } from "./ProductTable";
import { CategoryModal } from "@/components/category/CategoryModal";
import { cn } from "@/lib/utils";

export function ProductListModule() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const { data: products, pagination, isLoading, mutate } = useProduct({
    page,
    limit,
    search,
    categoryId: selectedCategoryId
  });

  const { data: categories, isLoading: isLoadingCategories, mutate: mutateCategories } = useCategory();
  const { deleteProduct } = useProductActions();

  const handleAdd = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative min-h-[800px]">
      {/* Category Sidebar */}
      <aside
        className={cn(
          "shrink-0 transition-all duration-500 ease-in-out relative",
          isSidebarCollapsed ? "w-0 lg:w-16 opacity-0 lg:opacity-100 overflow-hidden" : "w-full lg:w-72"
        )}
      >
        <div className={cn(
          "bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 space-y-6 sticky top-8 transition-all duration-500",
          isSidebarCollapsed && "lg:px-2 lg:py-8"
        )}>
          <div className={cn(
            "flex items-center justify-between",
            isSidebarCollapsed && "lg:flex-col lg:gap-6"
          )}>
            {!isSidebarCollapsed && (
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 truncate">
                <LayoutGrid className="w-5 h-5 text-violet-500" />
                Danh mục
              </h2>
            )}

            <div className="flex items-center gap-1">
              {!isSidebarCollapsed && <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="p-2 hover:bg-violet-100 dark:hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl transition-all active:scale-90"
                title="Thêm danh mục"
              >
                <Plus className="w-4 h-4" />
              </button>}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-xl transition-all active:scale-90"
                title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
              >
                {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isSidebarCollapsed && (
            <div className="flex justify-center border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
              <LayoutGrid className="w-6 h-6 text-violet-500" />
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={() => {
                setSelectedCategoryId(undefined);
                setPage(1);
              }}
              className={cn(
                "w-full flex items-center rounded-2xl text-[14px] font-bold transition-all",
                isSidebarCollapsed ? "justify-center h-12" : "justify-between px-4 py-3",
                !selectedCategoryId
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                  : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
              )}
              title="Tất cả sản phẩm"
            >
              {isSidebarCollapsed ? <Package className="w-5 h-5" /> : "Tất cả sản phẩm"}
            </button>

            {!isSidebarCollapsed && categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  setPage(1);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] font-bold transition-all group",
                  selectedCategoryId === cat.id
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Danh sách sản phẩm</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[15px]">Quản lý kho hàng và thông tin sản phẩm</p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-violet-200 dark:shadow-none text-[15px]"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all text-[15px] font-medium shadow-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="md:col-span-4 flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all text-[15px] font-bold shadow-sm">
              <Filter className="w-5 h-5" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        <ProductTable
          products={products}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
          <div className="bg-zinc-50/50 dark:bg-zinc-950/50">
            {pagination && (
              <Pagination
                id="products-list"
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
      </div>

      <ProductFormModule
        isOpen={isModalOpen}
        initialData={editingProduct}
        isEdit={!!editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={() => mutateCategories()}
      />
    </div>
  );
}
