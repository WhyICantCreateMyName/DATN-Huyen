"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[480px] z-10"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-nude/30 rounded-full mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-black">Khôi phục quyền truy cập</span>
        </div>
        <h1 className="text-5xl font-black text-black tracking-tighter mb-4 uppercase">QUÊN MẬT KHẨU</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Nhập email để nhận đường dẫn đặt lại mật khẩu</p>
      </div>

      <div className="bg-slate-50/50 backdrop-blur-xl border border-slate-100 p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50">
        {success ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-4">Kiểm tra Email</h3>
            <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 italic">
              Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-3 text-black font-black text-[10px] uppercase tracking-widest hover:gap-5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl text-xs font-bold">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-black transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-white border-2 border-transparent focus:border-black rounded-3xl py-5 pl-16 pr-6 outline-none font-bold text-sm transition-all shadow-sm group-hover:shadow-md"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white rounded-3xl py-6 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Gửi yêu cầu <ArrowRight className="absolute right-8 w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-black transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};
