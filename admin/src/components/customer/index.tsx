"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  UserPlus,
  RefreshCw,
  TrendingUp,
  UserCheck,
  UserX
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import CustomerTable from "./CustomerTable";
import CustomerModal from "./CustomerModal";
import { useCustomer, useCustomerActions } from "@/hooks/use-customer";
import { Customer } from "@/types/customer";
import { cn } from "@/lib/utils";

export default function CustomerListModule() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);

  const { data: customers, pagination, isLoading, mutate } = useCustomer({
    page,
    limit,
    search
  });

  const { deleteCustomer, isDeleting } = useCustomerActions();

  const handleAdd = () => {
    setSelectedCustomer(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      await deleteCustomer(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khách hàng"
        subtitle="Quản lý thông tin và lịch sử mua hàng của khách hàng"
        icon={Users}
        onRefresh={() => mutate()}
        refreshLoading={isLoading}
        addButtonText="Thêm khách hàng"
        onAdd={handleAdd}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Tổng khách hàng", value: pagination?.total || 0, icon: Users, color: "bg-violet-500" },
          { label: "Khách mới tháng này", value: "0", icon: TrendingUp, color: "bg-emerald-500" },
          { label: "Khách hàng hoạt động", value: pagination?.total || 0, icon: UserCheck, color: "bg-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2.5rem] flex items-center gap-5 group hover:border-violet-500/50 transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng theo tên, email hoặc số điện thoại..."
            className="w-full pl-14 pr-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content Table */}
      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
        <div className="bg-zinc-50/50 dark:bg-zinc-950/50">
          {pagination && (
            <Pagination
              id="customers-list"
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
        <CustomerModal
          initialData={selectedCustomer}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
