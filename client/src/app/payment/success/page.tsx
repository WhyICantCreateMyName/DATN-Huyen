"use client";

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/contexts/CartContext';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { refreshCart } = useCart();

  useEffect(() => {
    // Xóa giỏ hàng local nếu thanh toán thành công
    refreshCart();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-40 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 text-white p-16 rounded-[4rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full -mr-32 -mt-32" />
          <CheckCircle2 className="w-20 h-20 text-accent mx-auto mb-8" />
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4">Thanh toán thành công!</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4 leading-relaxed">
            Cảm ơn bạn đã tin tưởng Yuki Fashion. <br />Đơn hàng #{orderId?.slice(0, 8)} của bạn đang được xử lý.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/profile/orders"
              className="px-10 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              Xem đơn hàng
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="px-10 py-5 bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              Tiếp tục mua sắm
              <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
