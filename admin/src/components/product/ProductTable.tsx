"use client";

import React from "react";
import { Edit, Trash2, Package, Loader2 } from "lucide-react";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({ products, isLoading, onEdit, onDelete }: ProductTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
          <p className="text-sm font-bold text-zinc-400 animate-pulse uppercase tracking-widest">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] py-20 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-zinc-900 dark:text-white">Không có sản phẩm nào</p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Sản phẩm</th>
              <th className="px-6 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Danh mục</th>
              <th className="px-6 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-center">Biến thể</th>
              <th className="px-6 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Tồn kho</th>
              <th className="px-6 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest">Giá</th>
              <th className="px-6 py-5 text-[11px] font-black text-zinc-400 uppercase tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {products.map((product) => {
              const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
              const prices = product.variants?.map(v => Number(v.price)) || [];
              const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
              const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

              return (
                <tr key={product.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex-shrink-0 relative group-hover:shadow-lg transition-all duration-300">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-zinc-400 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-bold text-zinc-900 dark:text-white truncate max-w-[240px]">
                          {product.name}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          ID: {product.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 font-bold text-[13px] border border-zinc-200 dark:border-zinc-800">
                      {product.category?.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">{product.variants?.length || 0}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1.5">
                      <span className={cn(
                        "text-[15px] font-bold",
                        totalStock > 0 ? "text-zinc-900 dark:text-zinc-200" : "text-rose-500"
                      )}>
                        {totalStock} <span className="text-xs font-normal text-zinc-400">cái</span>
                      </span>
                      <div className="w-28 h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            totalStock > 20 ? "bg-violet-500" : totalStock > 0 ? "bg-amber-500" : "bg-rose-500"
                          )}
                          style={{ width: `${Math.min(totalStock, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-[15px] font-bold text-zinc-900 dark:text-white">
                      {minPrice === maxPrice ? (
                        `${minPrice.toLocaleString()}đ`
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-[11px] text-zinc-400 font-normal leading-tight">Từ</span>
                          <span>{minPrice.toLocaleString()}đ</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2.5 hover:bg-violet-50 dark:hover:bg-violet-500/10 text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
