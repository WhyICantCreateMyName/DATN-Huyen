"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login({ email, password });

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Đăng nhập thất bại. Vui lòng thử lại.');
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
          <span className="text-[10px] font-black uppercase tracking-widest text-black">Chào mừng trở lại</span>
        </div>
        <h1 className="text-5xl font-black text-black tracking-tighter mb-4 uppercase">YUKI FASHION</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đăng nhập để trải nghiệm đặc quyền hội viên</p>
      </div>

      <div className="bg-slate-50/50 backdrop-blur-xl border border-slate-100 p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl text-xs font-bold">
              {error}
            </div>
          )}

          <div className="space-y-2">
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

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Secure Password</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-black transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-white border-2 border-transparent focus:border-black rounded-3xl py-5 pl-16 pr-6 outline-none font-bold text-sm transition-all shadow-sm group-hover:shadow-md"
              />
            </div>
          </div>

          <div className="flex justify-end pr-4">
            <Link
              href="/forgot-password"
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white rounded-3xl py-6 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Bắt đầu mua sắm <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-black border-b-2 border-black pb-0.5 hover:text-accent hover:border-accent transition-all">
              Tham gia ngay
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};
