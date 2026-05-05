"use client";

import React from "react";
import { Eye, ShoppingCart, Calendar } from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "@/types/order";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { TableWrapper } from "@/components/ui/TableWrapper";

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
  onViewDetails: (order: Order) => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; dot: string }> = {
  [OrderStatus.PENDING]: { label: "Chờ xử lý", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", dot: "bg-amber-500" },
  [OrderStatus.PROCESSING]: { label: "Đang xử lý", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", dot: "bg-blue-500" },
  [OrderStatus.DELIVERING]: { label: "Đang giao", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10", dot: "bg-violet-500" },
  [OrderStatus.DELIVERED]: { label: "Đã giao", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", dot: "bg-emerald-500" },
  [OrderStatus.CANCELLED]: { label: "Đã hủy", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", dot: "bg-rose-500" },
  [OrderStatus.RETURN_REQUESTED]: { label: "Yêu cầu trả hàng", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10", dot: "bg-orange-500" },
  [OrderStatus.RETURNED]: { label: "Đã trả hàng", color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-50 dark:bg-zinc-500/10", dot: "bg-zinc-500" },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bg: string }> = {
  [PaymentStatus.PENDING]: { label: "Chưa thanh toán", color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-800" },
  [PaymentStatus.PAID]: { label: "Đã thanh toán", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  [PaymentStatus.FAILED]: { label: "Thanh toán lỗi", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10" },
  [PaymentStatus.REFUNDED]: { label: "Đã hoàn tiền", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10" },
};

export default function OrderTable({ orders, isLoading, onViewDetails }: OrderTableProps) {
  const columns = [
    { label: "Mã đơn & Ngày tạo" },
    { label: "Khách hàng" },
    { label: "Tổng tiền" },
    { label: "Sản phẩm", align: "center" as const },
    { label: "Trạng thái" },
    { label: "Thao tác", align: "right" as const },
  ];

  return (
    <TableWrapper
      isLoading={isLoading}
      isEmpty={orders.length === 0}
      emptyIcon={ShoppingCart}
      emptyTitle="Không có đơn hàng nào"
      emptyDescription="Chưa có đơn hàng nào khớp với bộ lọc của bạn"
      loadingText="Đang tải đơn hàng..."
      columns={columns}
    >
      {orders.map((order) => (
        <tr key={order.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors">
          <td className="px-6 py-5">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-bold text-zinc-900 dark:text-white uppercase tracking-tight">#{order.id.slice(0, 8)}</span>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[12px]">{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</span>
              </div>
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[15px] font-bold text-zinc-900 dark:text-white leading-tight">{order.customerName}</span>
              <span className="text-xs text-zinc-500 font-medium">{order.customerPhone}</span>
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[15px] font-black text-violet-600 dark:text-violet-400">{Number(order.totalAmount).toLocaleString()}đ</span>
              <span className={cn(
                "inline-flex items-center self-start px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                paymentStatusConfig[order.paymentStatus].bg,
                paymentStatusConfig[order.paymentStatus].color
              )}>
                {paymentStatusConfig[order.paymentStatus].label}
              </span>
            </div>
          </td>
          <td className="px-6 py-5 text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold text-[13px] border border-zinc-200 dark:border-zinc-800">
              {order.items.length}
            </span>
          </td>
          <td className="px-6 py-5">
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl font-bold text-[13px] border border-zinc-200 dark:border-zinc-800 shadow-sm",
              statusConfig[order.status].bg,
              statusConfig[order.status].color
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusConfig[order.status].dot)} />
              {statusConfig[order.status].label}
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
              <button
                onClick={() => onViewDetails(order)}
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
