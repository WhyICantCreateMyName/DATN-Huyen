"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useOrder, useOrderActions } from "@/hooks/use-order";
import { Order, OrderStatus } from "@/types/order";
import { Pagination } from "@/components/ui/Pagination";
import OrderTable from "./OrderTable";
import OrderModal from "./OrderModal";
import { cn } from "@/lib/utils";

const statusFilters: { label: string; value: OrderStatus | undefined; icon: any; color: string }[] = [
  { label: "Tất cả đơn", value: undefined, icon: ClipboardList, color: "text-zinc-500" },
  { label: "Chờ xử lý", value: OrderStatus.PENDING, icon: Clock, color: "text-amber-500" },
  { label: "Đang xử lý", value: OrderStatus.PROCESSING, icon: AlertCircle, color: "text-blue-500" },
  { label: "Đang giao", value: OrderStatus.DELIVERING, icon: Truck, color: "text-violet-500" },
  { label: "Đã giao", value: OrderStatus.DELIVERED, icon: CheckCircle2, color: "text-emerald-500" },
  { label: "Đã hủy", value: OrderStatus.CANCELLED, icon: XCircle, color: "text-rose-500" },
];

import { PageHeader } from "@/components/ui/PageHeader";

export function OrderListModule() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined);

  const { data: orders, pagination, isLoading, mutate } = useOrder({
    page,
    limit,
    search,
    status: selectedStatus
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative min-h-[800px]">
      {/* Status Sidebar */}
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
                <Filter className="w-5 h-5 text-violet-500" />
                Trạng thái
              </h2>
            )}

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-xl transition-all active:scale-90"
              title={isSidebarCollapsed ? "Mở rộng" : "Thu gọn"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          <div className="space-y-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => {
                  setSelectedStatus(filter.value);
                  setPage(1);
                }}
                className={cn(
                  "w-full flex items-center rounded-2xl text-[14px] font-bold transition-all group",
                  isSidebarCollapsed ? "justify-center h-12" : "justify-start px-4 py-3 gap-3",
                  selectedStatus === filter.value
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
                )}
                title={filter.label}
              >
                <filter.icon className={cn(
                  "w-5 h-5 shrink-0",
                  selectedStatus === filter.value ? "text-white" : filter.color
                )} />
                {!isSidebarCollapsed && <span>{filter.label}</span>}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 space-y-6 min-w-0">
        <PageHeader
          title="Quản lý đơn hàng"
          subtitle="Theo dõi và xử lý đơn đặt hàng của khách hàng"
          icon={ClipboardList}
          onRefresh={() => mutate()}
          refreshLoading={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-12 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, tên khách hàng hoặc số điện thoại..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all text-[15px] font-medium shadow-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <OrderTable
          orders={orders}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
        />

        <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
          <div className="bg-zinc-50/50 dark:bg-zinc-950/50">
            {pagination && (
              <Pagination
                id="orders-list"
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
        <OrderModal
          order={selectedOrder}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
