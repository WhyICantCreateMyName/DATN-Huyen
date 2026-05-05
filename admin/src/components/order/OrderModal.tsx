"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Order, OrderStatus, PaymentStatus } from "@/types/order";
import { useOrderActions } from "@/hooks/use-order";
import {
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Clipboard,
  AlertCircle,
  Truck,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface OrderModalProps {
  order?: Order;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions: { value: OrderStatus; label: string; icon: any; color: string }[] = [
  { value: OrderStatus.PENDING, label: "Chờ xử lý", icon: Clock, color: "text-amber-500" },
  { value: OrderStatus.PROCESSING, label: "Đang xử lý", icon: AlertCircle, color: "text-blue-500" },
  { value: OrderStatus.DELIVERING, label: "Đang giao hàng", icon: Truck, color: "text-violet-500" },
  { value: OrderStatus.DELIVERED, label: "Đã giao hàng", icon: CheckCircle2, color: "text-emerald-500" },
  { value: OrderStatus.CANCELLED, label: "Đã hủy đơn", icon: XCircle, color: "text-rose-500" },
];

const paymentOptions: { value: PaymentStatus; label: string; color: string }[] = [
  { value: PaymentStatus.PENDING, label: "Chưa thanh toán", color: "text-zinc-500" },
  { value: PaymentStatus.PAID, label: "Đã thanh toán", color: "text-emerald-500" },
  { value: PaymentStatus.FAILED, label: "Thanh toán lỗi", color: "text-rose-500" },
  { value: PaymentStatus.REFUNDED, label: "Đã hoàn tiền", color: "text-violet-500" },
];

export default function OrderModal({ order: initialOrder, onClose, onSuccess }: OrderModalProps) {
  const { updateOrderStatus, updatePaymentStatus, isUpdatingStatus, isUpdatingPayment } = useOrderActions();
  const [currentOrder, setCurrentOrder] = React.useState<Order | undefined>(initialOrder);

  React.useEffect(() => {
    setCurrentOrder(initialOrder);
  }, [initialOrder]);

  if (!currentOrder) return null;

  const handleStatusChange = async (status: OrderStatus) => {
    if (status === currentOrder.status) return;
    try {
      const result = await updateOrderStatus({ id: currentOrder.id, status });
      if (result === 200) {
        setCurrentOrder(prev => prev ? { ...prev, status } : prev);
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentStatusChange = async (status: PaymentStatus) => {
    if (status === currentOrder.paymentStatus) return;
    try {
      const result = await updatePaymentStatus({ id: currentOrder.id, status });
      if (result === 200) {
        setCurrentOrder(prev => prev ? { ...prev, paymentStatus: status } : prev);
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={`Chi tiết đơn hàng #${currentOrder.id.slice(0, 8)}`}
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Info Card */}
          <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 space-y-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              <User className="w-5 h-5 text-violet-500" />
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <User className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-bold text-zinc-900 dark:text-white">{currentOrder.customerName}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span className="text-sm">{currentOrder.customerPhone}</span>
                </div>
                {currentOrder.customerEmail && (
                  <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{currentOrder.customerEmail}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-zinc-600 dark:text-zinc-400">
                  <MapPin className="w-4 h-4 shrink-0 mt-1" />
                  <span className="text-sm leading-relaxed">{currentOrder.shippingAddress}</span>
                </div>
                {currentOrder.notes && (
                  <div className="flex items-start gap-3 text-zinc-600 dark:text-zinc-400">
                    <Clipboard className="w-4 h-4 shrink-0 mt-1" />
                    <span className="text-sm italic">"{currentOrder.notes}"</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                <Package className="w-5 h-5 text-violet-500" />
                Danh sách sản phẩm ({currentOrder.items.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-900/50">
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sản phẩm</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Số lượng</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Đơn giá</th>
                    <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {currentOrder.items.map((item) => (
                    <tr key={item.id} className="group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800">
                            {item.variant.product.images?.[0] ? (
                              <img src={item.variant.product.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-zinc-400 m-auto mt-3" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{item.variant.product.name}</p>
                            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-tighter mt-0.5">
                              {item.variant.color} / {item.variant.size}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">x{item.quantity}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{Number(item.price).toLocaleString()}đ</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          {(Number(item.price) * item.quantity).toLocaleString()}đ
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
                    <td colSpan={3} className="px-8 py-6 text-right">
                      <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Tổng cộng thanh toán</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-xl font-black text-violet-600 dark:text-violet-400">
                        {Number(currentOrder.totalAmount).toLocaleString()}đ
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Status */}
        <div className="space-y-8">
          {/* Order Status Update */}
          <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 space-y-6 sticky top-0">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                <Truck className="w-5 h-5 text-violet-500" />
                Trạng thái đơn hàng
              </h3>
              <p className="text-xs text-zinc-500 font-medium">Cập nhật tiến độ xử lý đơn hàng</p>
            </div>

            <div className="space-y-3">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(opt.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all active:scale-[0.98] group",
                    currentOrder.status === opt.value
                      ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/20"
                      : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-violet-500/50 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <opt.icon className={cn(
                    "w-5 h-5",
                    currentOrder.status === opt.value ? "text-white" : opt.color
                  )} />
                  <span className="text-[14px] font-bold">{opt.label}</span>
                  {currentOrder.status === opt.value && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-violet-500" />
                  Thanh toán
                </h3>
                <p className="text-xs text-zinc-500 font-medium">Quản lý trạng thái dòng tiền</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {paymentOptions.map((opt) => (
                  <button
                    key={opt.value}
                    disabled={isUpdatingPayment}
                    onClick={() => handlePaymentStatusChange(opt.value)}
                    className={cn(
                      "px-3 py-3 rounded-xl border text-[12px] font-black uppercase tracking-tighter transition-all active:scale-95",
                      currentOrder.paymentStatus === opt.value
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-lg"
                        : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span className="text-[11px] font-medium uppercase tracking-widest">
                  Tạo lúc: {format(new Date(currentOrder.createdAt), "dd MMMM yyyy, HH:mm", { locale: vi })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
