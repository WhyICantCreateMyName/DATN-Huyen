"use client";

import { useState } from "react";
import {
  Search,
  Package,
  ShoppingCart,
  TrendingUp,
  History,
  Filter
} from "lucide-react";
import { usePurchase } from "@/hooks/use-purchase";
import { Pagination } from "@/components/ui/Pagination";
import PurchaseTable from "./PurchaseTable";
import PurchaseModal from "./PurchaseModal";
import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/ui/PageHeader";

export function PurchaseListModule() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | undefined>(undefined);

  const { data: invoices, pagination, isLoading, mutate } = usePurchase({
    page,
    limit,
    search
  });

  const handleCreateNew = () => {
    setSelectedInvoice(undefined);
    setIsModalOpen(true);
  };

  const handleViewDetails = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhập hàng"
        subtitle="Quản lý và theo dõi các đợt nhập hàng vào kho"
        icon={Package}
        onRefresh={() => mutate()}
        refreshLoading={isLoading}
        addButtonText="Tạo hóa đơn mới"
        onAdd={handleCreateNew}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Tổng vốn nhập", value: pagination?.total || 0, icon: TrendingUp, color: "bg-emerald-500" },
          { label: "Hóa đơn tháng này", value: invoices.length, icon: History, color: "bg-violet-500" },
          { label: "Sản phẩm vừa nhập", value: "0", icon: ShoppingCart, color: "bg-amber-500" },
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
            placeholder="Tìm kiếm hóa đơn theo tên nhà cung cấp..."
            className="w-full pl-14 pr-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-none rounded-[1.75rem] focus:ring-4 focus:ring-violet-500/10 outline-none transition-all text-[15px] font-medium"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button className="px-6 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-[1.75rem] font-bold flex items-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all">
          <Filter className="w-5 h-5" />
          Bộ lọc
        </button>
      </div>

      {/* Table Section */}
      <div className="space-y-6">
        <PurchaseTable
          invoices={invoices}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
        />

        <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
          <div className="bg-zinc-50/50 dark:bg-zinc-950/50">
            {pagination && (
              <Pagination
                id="purchase-list"
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

      {isModalOpen && (
        <PurchaseModal
          initialData={selectedInvoice}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
