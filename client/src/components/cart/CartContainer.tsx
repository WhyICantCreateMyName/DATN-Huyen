"use client";

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CartContainer() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
      <header className="mb-16">
        <div className="flex items-end gap-4 mb-4">
          <h1 className="text-6xl font-black tracking-tighter uppercase leading-none text-slate-900">Giỏ hàng</h1>
          <span className="text-xl font-bold text-slate-300 mb-1">/ {totalItems} sản phẩm</span>
        </div>
        <div className="h-2 w-24 bg-accent" />
      </header>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-100 rounded-[3rem]"
        >
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
            <ShoppingCart className="w-10 h-10 text-slate-200" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-slate-400">Giỏ hàng đang trống</h2>
          <Link
            href="/products"
            className="px-10 py-5 bg-black text-white rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform active:scale-95"
          >
            Bắt đầu mua sắm
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:border-slate-200 transition-colors group"
                >
                  <Link
                    href={`/product/${item.variant.productId || item.variant.product.id}`}
                    className="relative w-40 h-48 bg-white rounded-3xl overflow-hidden flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <Image
                      src={item.variant.product.images?.[0]}
                      alt={item.variant.product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>

                  <div className="flex-grow space-y-4 text-center sm:text-left">
                    <div>
                      <Link href={`/product/${item.variant.productId || item.variant.product.id}`}>
                        <h3 className="text-xl font-black uppercase tracking-tight mb-1 hover:text-accent transition-colors cursor-pointer">
                          {item.variant.product.name}
                        </h3>
                      </Link>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Size: <span className="text-black">{item.variant.size || 'N/A'}</span> •
                        Màu: <span className="text-black">{item.variant.color || 'Default'}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-6">
                      <div className="flex items-center bg-white border border-slate-200 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:text-accent transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:text-accent transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="sm:text-right pr-4">
                    <p className="text-2xl font-black tracking-tighter text-slate-900">
                      {(Number(item.variant.price) * item.quantity).toLocaleString('vi-VN')}₫
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {Number(item.variant.price).toLocaleString('vi-VN')}₫ / sản phẩm
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary Box */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] sticky top-32 shadow-2xl shadow-slate-200">
              <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Thanh toán</h3>

              <div className="space-y-4 mb-8 pb-8 border-b border-white/10">
                <div className="flex justify-between text-slate-400 font-bold uppercase text-xs tracking-widest">
                  <span>Tạm tính</span>
                  <span className="text-white">{totalPrice.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between text-slate-400 font-bold uppercase text-xs tracking-widest">
                  <span>Vận chuyển</span>
                  <span className="text-white italic">Miễn phí</span>
                </div>
                <div className="flex justify-between text-slate-400 font-bold uppercase text-xs tracking-widest">
                  <span>Thuế (VAT)</span>
                  <span className="text-white">0₫</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-10">
                <span className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Tổng cộng</span>
                <span className="text-4xl font-black tracking-tighter leading-none">
                  {totalPrice.toLocaleString('vi-VN')}₫
                </span>
              </div>

              <Link 
                href="/checkout"
                className="group w-full bg-accent text-white py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all shadow-xl shadow-accent/20 active:scale-95"
              >
                Tiến hành đặt hàng
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <p className="mt-8 text-center text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed italic">
                * Miễn phí giao hàng cho tất cả các đơn hàng trong tháng này.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
