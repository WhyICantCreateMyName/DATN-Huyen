"use client";

import React from "react";
import {
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon
} from "lucide-react";
import { Customer } from "@/types/customer";
import { TableWrapper } from "@/components/ui/TableWrapper";

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

export default function CustomerTable({ customers, isLoading, onEdit, onDelete }: CustomerTableProps) {
  const columns = [
    { label: "Khách hàng" },
    { label: "Liên hệ" },
    { label: "Địa chỉ" },
    { label: "Ngày tham gia" },
    { label: "Thao tác", align: "right" as const },
  ];

  return (
    <TableWrapper
      isLoading={isLoading}
      isEmpty={customers.length === 0}
      emptyIcon={UserIcon}
      emptyTitle="Chưa có khách hàng nào"
      loadingText="Đang tải khách hàng..."
      columns={columns}
    >
      {customers.map((customer) => (
        <tr key={customer.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors">
          <td className="px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <UserIcon className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-zinc-900 dark:text-white truncate">
                  {customer.name}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                  ID: {customer.id.slice(0, 8)}
                </p>
              </div>
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[13px] font-medium">{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[13px] font-medium">{customer.phone}</span>
                </div>
              )}
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex items-start gap-2 max-w-[200px]">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 mt-0.5 shrink-0" />
              <span className="text-[13px] text-zinc-600 dark:text-zinc-400 font-medium line-clamp-1">
                {customer.address || "Chưa cập nhật"}
              </span>
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[13px] font-medium">
                {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </td>
          <td className="px-6 py-5 text-right">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => onEdit(customer)}
                className="p-2 text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-all"
                title="Chỉnh sửa"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(customer.id)}
                className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                title="Xóa khách hàng"
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
