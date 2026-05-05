"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const code = searchParams.get('code');

  const getErrorMessage = () => {
    if (reason === 'invalid_signature') return 'Chữ ký không hợp lệ. Giao dịch bị nghi ngờ.';
    if (code === '24') return 'Giao dịch đã được hủy bởi khách hàng.';
    return 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.';
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-40 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white text-slate-900 p-16 rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden"
        >
          <XCircle className="w-20 h-20 text-rose-500 mx-auto mb-8" />
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-4 text-slate-900">Thanh toán thất bại</h1>
          <div className="bg-rose-50 p-6 rounded-2xl mb-12 flex items-center gap-4 text-left">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <p className="text-rose-900 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
              Lỗi: {getErrorMessage()}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/checkout"
              className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
            >
              Thử lại thanh toán
              <RefreshCcw className="w-4 h-4" />
            </Link>
            <Link
              href="/cart"
              className="px-10 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              Quay lại giỏ hàng
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
