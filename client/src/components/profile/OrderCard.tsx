import React from 'react';
import { Clock, Package, Truck, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { OrderType } from '@/types';

const statusConfig: Record<OrderType.OrderStatus, { label: string; color: string; icon: any }> = {
  [OrderType.OrderStatus.PENDING]: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700', icon: Clock },
  [OrderType.OrderStatus.PROCESSING]: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700', icon: Package },
  [OrderType.OrderStatus.DELIVERING]: { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-700', icon: Truck },
  [OrderType.OrderStatus.DELIVERED]: { label: 'Đã giao hàng', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  [OrderType.OrderStatus.CANCELLED]: { label: 'Đã hủy', color: 'bg-rose-100 text-rose-700', icon: XCircle },
  [OrderType.OrderStatus.RETURN_REQUESTED]: { label: 'Yêu cầu trả hàng', color: 'bg-slate-100 text-slate-700', icon: XCircle },
  [OrderType.OrderStatus.RETURNED]: { label: 'Đã trả hàng', color: 'bg-slate-200 text-slate-900', icon: XCircle },
};

const paymentStatusConfig: Record<OrderType.PaymentStatus, { label: string; color: string }> = {
  [OrderType.PaymentStatus.PENDING]: { label: 'Chưa thanh toán', color: 'text-amber-600' },
  [OrderType.PaymentStatus.PAID]: { label: 'Đã thanh toán', color: 'text-emerald-600' },
  [OrderType.PaymentStatus.FAILED]: { label: 'Thanh toán lỗi', color: 'text-rose-600' },
  [OrderType.PaymentStatus.REFUNDED]: { label: 'Đã hoàn tiền', color: 'text-blue-600' },
};

interface OrderCardProps {
  order: OrderType.Order;
  index: number;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, index }) => {
  const status = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;
  const paymentStatus = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.PENDING;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-[2.5rem] border-2 border-slate-100 hover:border-slate-900 transition-all p-8 md:p-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            <span className="text-slate-300 text-xs font-bold">/</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${paymentStatus.color}`}>
              {paymentStatus.label}
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase">Đơn hàng #{order.id.slice(0, 8)}</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            Ngày đặt: {format(new Date(order.createdAt), 'dd MMMM, yyyy', { locale: vi })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Tổng thanh toán</p>
          <p className="text-3xl font-black tracking-tighter text-slate-900">
            {Number(order.totalAmount).toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-end">
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {order.items.map((item) => (
            <div key={item.id} className="relative group/item aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img 
                src={item.variant.product.images[0] || 'https://via.placeholder.com/300x400'} 
                alt={item.variant.product.name}
                className="w-full h-full object-cover group-hover/item:scale-110 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                <p className="text-[8px] font-black text-white uppercase truncate">{item.variant.product.name}</p>
                <p className="text-[7px] font-bold text-white/70 uppercase">Size: {item.variant.size} x {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        
        <Link 
          href={`/profile/orders/${order.id}`}
          className="w-full md:w-auto px-8 py-5 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3 group/btn"
        >
          Chi tiết đơn hàng
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};
