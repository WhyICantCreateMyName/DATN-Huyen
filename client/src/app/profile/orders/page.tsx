"use client";

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useOrders } from '@/hooks/use-order';
import { OrderCard } from '@/components/profile/OrderCard';

export default function OrdersPage() {
  const { orders, isLoading } = useOrders();

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

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 pt-40 pb-20">
        <header className="mb-12">
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-2">Đơn hàng của tôi</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Theo dõi lịch sử mua sắm của bạn</p>
        </header>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-6" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mb-8">Bạn chưa có đơn hàng nào</p>
            <Link 
              href="/products" 
              className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all inline-block"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            {orders.map((order, idx) => (
              <OrderCard key={order.id} order={order} index={idx} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
