"use client";

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { Truck, CreditCard, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateOrderData } from '@/services/order.service';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import axios from '@/services/axios';
import { useCreateOrder } from '@/hooks/use-order';

export default function CheckoutContainer() {
  const { items, totalPrice } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { createOrder, isCreating } = useCreateOrder();
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [useSavedInfo, setUseSavedInfo] = useState(false);
  const [formData, setFormData] = useState<CreateOrderData>({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    shippingAddress: user?.address || '',
    notes: '',
    paymentMethod: 'COD'
  });

  console.log("formData: ", formData);

  // Cập nhật form khi toggle "Sử dụng thông tin đã lưu"
  React.useEffect(() => {
    if (useSavedInfo && user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerPhone: user.phone || prev.customerPhone,
        customerEmail: user.email || prev.customerEmail,
        shippingAddress: user.address || prev.shippingAddress,
      }));
    }
  }, [useSavedInfo, user]);

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Giỏ hàng trống</h2>
        <Link href="/products" className="text-accent font-bold uppercase tracking-widest text-xs hover:underline">
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.shippingAddress) {
      toast({ title: 'Lỗi', message: 'Vui lòng điền đầy đủ thông tin giao hàng', variant: 'error' });
      return;
    }

    console.log("Submitting order with method:", formData.paymentMethod);
    try {
      const resData = await createOrder(formData);
      console.log("Order created response:", resData);
      const order = resData.data.order;

      if (formData.paymentMethod.toUpperCase() === 'VNPAY') {
        console.log("Payment method is VNPAY, creating payment URL for order:", order.id);
        // Gọi API lấy link thanh toán VNPay
        const paymentResponse = await axios.post('/payment/vnpay/create', { orderId: order.id });
        console.log("Payment URL response:", paymentResponse.data);
        const { paymentUrl } = paymentResponse.data.data;

        console.log("Redirecting to:", paymentUrl);
        toast({ title: 'Đang chuyển hướng', message: 'Đang kết nối tới cổng thanh toán VNPay...', variant: 'success' });

        // Chuyển hướng sang VNPay
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 1000);
        return;
      }

      setOrderSuccess(true);
      toast({ title: 'Thành công', message: 'Đơn hàng của bạn đã được tiếp nhận', variant: 'success' });
    } catch (error: any) {
      console.error("Submit order error:", error);
    }
  };

  if (orderSuccess) {
    return (
      <main className="max-w-3xl mx-auto px-6 pt-40 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 text-white p-16 rounded-[4rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full -mr-32 -mt-32" />
          <CheckCircle2 className="w-20 h-20 text-accent mx-auto mb-8" />
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">Cảm ơn bạn!</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-12 leading-relaxed">
            Đơn hàng của bạn đã được đặt thành công. <br />Chúng tôi sẽ liên hệ sớm để xác nhận.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/profile/orders"
              className="px-10 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
            >
              Xem đơn hàng
            </Link>
            <Link
              href="/"
              className="px-10 py-5 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
            >
              Về trang chủ
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
      <header className="mb-16">
        <Link href="/cart" className="flex items-center gap-2 text-slate-400 hover:text-black transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Quay lại giỏ hàng</span>
        </Link>
        <div className="flex items-end gap-4 mb-4">
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-slate-900">Thanh toán</h1>
        </div>
        <div className="h-2 w-24 bg-accent" />
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Side - Forms */}
        <div className="lg:col-span-7 space-y-12">
          {/* Shipping Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Thông tin giao hàng</h2>
            </div>

            {/* Toggle Saved Info */}
            {user?.address && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-accent/20 transition-colors"
                onClick={() => setUseSavedInfo(!useSavedInfo)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${useSavedInfo ? 'border-accent bg-accent' : 'border-slate-300'}`}>
                    {useSavedInfo && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Sử dụng thông tin đã lưu</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Tiết kiệm thời gian nhập liệu</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Họ và tên *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-2 focus:ring-accent transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Số điện thoại *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="0901234567"
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-2 focus:ring-accent transition-all"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email (Không bắt buộc)</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="a@gmail.com"
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Địa chỉ nhận hàng *</label>
                <input
                  type="text"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  placeholder="Số nhà, tên đường, phường/xã..."
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-2 focus:ring-accent transition-all"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ghi chú đơn hàng</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Lưu ý cho shipper..."
                  rows={3}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold focus:ring-2 focus:ring-accent transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Phương thức thanh toán</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`
                relative p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4
                ${formData.paymentMethod === 'COD' ? 'border-accent bg-accent/5' : 'border-slate-100 bg-white hover:border-slate-200'}
              `}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-black text-[10px] uppercase tracking-widest">COD</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Thanh toán khi nhận hàng</p>
                </div>
              </label>

              <label className={`
                relative p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-4
                ${formData.paymentMethod === 'VNPAY' ? 'border-accent bg-accent/5' : 'border-slate-100 bg-white hover:border-slate-200'}
              `}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="VNPAY"
                  checked={formData.paymentMethod === 'VNPAY'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="font-black text-[10px] uppercase tracking-widest">VNPay</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Cổng thanh toán VNPay</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Side - Summary */}
        <div className="lg:col-span-5">
          <div className="bg-slate-50 border border-slate-100 p-10 rounded-[3rem] sticky top-32">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Tóm tắt đơn hàng</h3>

            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-8 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                    <img
                      src={item.variant.product.images?.[0]}
                      alt={item.variant.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase tracking-tight line-clamp-1">{item.variant.product.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {item.variant.size} • {item.variant.color} • x{item.quantity}
                    </p>
                  </div>
                  <p className="text-[12px] font-black tracking-tighter">
                    {(Number(item.variant.price) * item.quantity).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-8 pb-8 border-b border-slate-200">
              <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                <span>Tạm tính</span>
                <span className="text-slate-900">{totalPrice.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                <span>Vận chuyển</span>
                <span className="text-slate-900">0₫</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-10">
              <span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Tổng tiền</span>
              <span className="text-4xl font-black tracking-tighter leading-none text-slate-900">
                {totalPrice.toLocaleString('vi-VN')}₫
              </span>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="group w-full bg-slate-900 text-accent py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
            >
              {isCreating ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
