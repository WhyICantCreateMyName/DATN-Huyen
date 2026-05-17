"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle2, Clock, XCircle, ChevronLeft, MapPin, Phone, User, CreditCard, ReceiptText, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useOrderDetail } from '@/hooks/use-order';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import axios from '@/services/axios';
import { useToast } from '@/contexts/ToastContext';

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

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { order, isLoading } = useOrderDetail(id);
  const { toast } = useToast();
  const [isPaying, setIsPaying] = React.useState(false);

  const handlePayNow = async () => {
    try {
      setIsPaying(true);
      
      // 1. Cập nhật phương thức thanh toán sang VNPAY nếu chưa phải
      if (order?.paymentMethod !== 'VNPAY') {
        await axios.patch(`/orders/${id}/payment-method`, { paymentMethod: 'VNPAY' });
      }

      // 2. Tạo link thanh toán VNPAY
      const response = await axios.post('/payment/vnpay/create', { orderId: id });
      const { paymentUrl } = response.data.data;

      toast({ 
        title: 'Đang chuyển hướng', 
        message: 'Đang kết nối tới cổng thanh toán VNPay...', 
        variant: 'success' 
      });

      // 3. Chuyển hướng
      setTimeout(() => {
        window.location.href = paymentUrl;
      }, 800);
    } catch (error: any) {
      console.error('Pay now error:', error);
      toast({ 
        title: 'Lỗi', 
        message: error.response?.data?.error || 'Không thể khởi tạo thanh toán', 
        variant: 'error' 
      });
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="pt-40 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white min-h-screen text-center pt-40">
        <Navbar />
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h1>
        <button onClick={() => router.back()} className="text-slate-500 font-bold uppercase tracking-widest text-xs">Quay lại</button>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 pt-40 pb-20">
        <Link 
          href="/profile/orders"
          className="inline-flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {format(new Date(order.createdAt), 'dd MMMM, yyyy HH:mm', { locale: vi })}
              </p>
            </div>
            <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">Chi tiết đơn hàng</h1>
            <p className="text-slate-400 font-black text-xl mt-2 tracking-tighter">#{order.id}</p>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm">
              <ReceiptText className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng cộng</p>
              <p className="text-3xl font-black tracking-tighter">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Sản phẩm đã chọn
              </h3>
              
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-6 group">
                  <div className="w-32 aspect-[3/4] bg-slate-50 rounded-3xl overflow-hidden border-2 border-slate-100 group-hover:border-slate-900 transition-all flex-shrink-0 shadow-sm">
                    <img 
                      src={item.variant.product.images[0] || 'https://via.placeholder.com/300x400'} 
                      alt={item.variant.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <div className="flex flex-col justify-center py-2">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">YUKI FASHION / {item.variant.product.category?.name || 'BST MỚI'}</p>
                    <h4 className="text-2xl font-black tracking-tighter uppercase mb-2 group-hover:translate-x-2 transition-transform">{item.variant.product.name}</h4>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600">Size: {item.variant.size}</span>
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600">Color: {item.variant.color}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-black tracking-tighter">{Number(item.price).toLocaleString('vi-VN')}đ</p>
                      <span className="text-slate-300 text-xs">x</span>
                      <p className="text-lg font-black text-slate-400">{item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-8">
            {/* Shipping info */}
            <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 blur-[80px] rounded-full -mr-24 -mt-24" />
              
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                Thông tin nhận hàng
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <User className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Người nhận</p>
                    <p className="font-bold text-lg leading-tight tracking-tight">{order.customerName}</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Phone className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Điện thoại</p>
                    <p className="font-bold text-lg leading-tight tracking-tight">{order.customerPhone}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <MapPin className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Địa chỉ</p>
                    <p className="font-bold text-sm leading-relaxed text-slate-300">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment info */}
            <div className="bg-slate-50 p-10 rounded-[3.5rem] border-2 border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-900" />
                Thanh toán
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phương thức</p>
                  <p className="font-black text-lg uppercase tracking-tighter">{order.paymentMethod}</p>
                </div>
                
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trạng thái</p>
                  <p className={`font-black text-lg uppercase tracking-tighter ${
                    order.paymentStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                  </p>
                </div>

                {order.paymentStatus !== 'PAID' && order.status !== 'CANCELLED' && (
                  <button
                    onClick={handlePayNow}
                    disabled={isPaying}
                    className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPaying ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-accent" />
                        Thanh toán ngay bằng VNPAY
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
