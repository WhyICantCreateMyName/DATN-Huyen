"use client";

import React from "react";
import { 
  Edit2, 
  Trash2, 
  Mail, 
  Shield, 
  Calendar,
  User as UserIcon
} from "lucide-react";
import { AuthType } from "@/types";
import { TableWrapper } from "@/components/ui/TableWrapper";
import { cn } from "@/lib/utils";

interface UserTableProps {
  users: AuthType.User[];
  isLoading: boolean;
  onEdit: (user: AuthType.User) => void;
  onDelete: (id: string) => void;
}

export default function UserTable({ users, isLoading, onEdit, onDelete }: UserTableProps) {
  const columns = [
    { label: "Tài khoản" },
    { label: "Email" },
    { label: "Vai trò" },
    { label: "Ngày tạo" },
    { label: "Thao tác", align: "right" as const },
  ];

  return (
    <TableWrapper
      isLoading={isLoading}
      isEmpty={users.length === 0}
      emptyIcon={UserIcon}
      emptyTitle="Chưa có tài khoản nào"
      loadingText="Đang tải danh sách tài khoản..."
      columns={columns}
    >
      {users.map((user) => (
        <tr key={user.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors">
          <td className="px-6 py-5">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/10",
                user.role === 'ADMIN' 
                  ? "bg-violet-600 text-white" 
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
              )}>
                <UserIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-zinc-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                  ID: {user.id.slice(0, 8)}
                </p>
              </div>
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[13px] font-medium">{user.email}</span>
            </div>
          </td>
          <td className="px-6 py-5">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold tracking-wider uppercase",
              user.role === 'ADMIN'
                ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
            )}>
              <Shield className="w-3 h-3" />
              {user.role}
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[13px] font-medium">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </td>
          <td className="px-6 py-5 text-right">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => onEdit(user)}
                className="p-2 text-zinc-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-xl transition-all"
                title="Chỉnh sửa"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                title="Xóa tài khoản"
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
