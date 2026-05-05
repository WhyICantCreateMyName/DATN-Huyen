"use client";

import React from "react";
import {
  Eye,
  Calendar,
  User,
  Hash,
  Clock,
  Package,
  ChevronRight
} from "lucide-react";
import { PurchaseInvoice } from "@/types/purchase-invoice";
import { TableWrapper } from "@/components/ui/TableWrapper";

interface PurchaseTableProps {
  invoices: PurchaseInvoice[];
  isLoading: boolean;
  onViewDetails: (invoice: PurchaseInvoice) => void;
}

export default function PurchaseTable({ invoices, isLoading, onViewDetails }: PurchaseTableProps) {
  const columns = [
    { label: "Hóa đơn" },
    { label: "Nhà cung cấp" },
    { label: "Tổng tiền", align: "right" as const },
    { label: "Ngày nhập" },
    { label: "Hành động", align: "center" as const },
  ];

  return (
    <TableWrapper
      isLoading={isLoading}
      isEmpty={!invoices || invoices.length === 0}
      emptyIcon={Package}
      emptyTitle="Chưa có hóa đơn nào"
      emptyDescription="Các hóa đơn nhập hàng sẽ xuất hiện tại đây"
      columns={columns}
    >
      {invoices.map((invoice) => (
        <tr key={invoice.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all duration-300">
          <td className="px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 dark:bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Hash className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-zinc-900 dark:text-white truncate max-w-[120px]">
                  {invoice.id.split('-')[0].toUpperCase()}
                </div>
                <div className="text-[12px] text-zinc-400 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  {invoice.items?.length || 0} sản phẩm
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-500" />
              </div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {invoice.supplierName}
              </span>
            </div>
          </td>
          <td className="px-6 py-5 text-right">
            <div className="font-black text-zinc-900 dark:text-white">
              {Number(invoice.totalAmount).toLocaleString()}đ
            </div>
            <div className="text-[11px] text-zinc-400 uppercase font-bold tracking-tighter">VND</div>
          </td>
          <td className="px-6 py-5">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Calendar className="w-4 h-4" />
              <span className="text-[14px]">
                {new Date(invoice.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="text-[12px] text-zinc-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {new Date(invoice.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
              <button
                onClick={() => onViewDetails(invoice)}
                className="p-2.5 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl hover:bg-violet-600 hover:text-white transition-all shadow-md shadow-violet-500/10 active:scale-90"
                title="Xem chi tiết"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </TableWrapper>
  );
}
