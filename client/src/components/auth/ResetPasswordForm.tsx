"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ hoặc đã thiếu. Vui lòng kiểm tra lại link trong email.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
          <span className="text-[10px] font-black uppercase tracking-widest text-black">Thiết lập bảo mật</span>
        </div>
        <h1 className="text-5xl font-black text-black tracking-tighter mb-4 uppercase">ĐẶT LẠI MẬT KHẨU</h1>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Tạo mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <div className="bg-slate-50/50 backdrop-blur-xl border border-slate-100 p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50">
        {success ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-4">Thành công!</h3>
            <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10 italic">
              Mật khẩu của bạn đã được cập nhật. Đang chuyển hướng về trang đăng nhập...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl text-xs font-bold">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">New Password</label>
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

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Confirm New Password</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-black transition-colors" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-transparent focus:border-black rounded-3xl py-5 pl-16 pr-6 outline-none font-bold text-sm transition-all shadow-sm group-hover:shadow-md"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full bg-black text-white rounded-3xl py-6 font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Cập nhật mật khẩu</>
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
