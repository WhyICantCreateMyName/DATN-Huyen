"use client";

import React from "react";
import { Edit, Trash, Image as ImageIcon, MoreHorizontal, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionTableProps {
  collections: any[];
  isLoading: boolean;
  onEdit: (collection: any) => void;
  onDelete: (id: string) => void;
}

export default function CollectionTable({ collections, isLoading, onEdit, onDelete }: CollectionTableProps) {
  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="p-20 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ImageIcon className="w-8 h-8 text-slate-200" />
        </div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-2">Chưa có bộ sưu tập nào</h3>
        <p className="text-slate-500 font-medium text-sm">Hãy bắt đầu bằng cách tạo bộ sưu tập mới của bạn.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-50">
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Bộ sưu tập</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Slug</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Sản phẩm</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Trạng thái</th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {collections.map((collection) => (
            <tr key={collection.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {collection.image ? (
                      <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{collection.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold truncate max-w-[200px]">
                      {collection.description || "Không có mô tả"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full uppercase tracking-widest">
                  {collection.slug}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Package className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-black text-slate-900">{collection._count?.products || 0}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg",
                  collection.isActive 
                    ? "bg-emerald-50 text-emerald-600" 
                    : "bg-rose-50 text-rose-600"
                )}>
                  {collection.isActive ? "Hoạt động" : "Tạm ẩn"}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(collection)}
                    className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-900 rounded-xl transition-all active:scale-90"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(collection.id)}
                    className="p-2 bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-600 rounded-xl transition-all active:scale-90"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
