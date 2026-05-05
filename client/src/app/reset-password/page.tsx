import { Suspense } from 'react';
import { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu | Yuki Fashion",
  description: "Thiết lập mật khẩu mới cho tài khoản Yuki Fashion của bạn.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[10%] w-[40%] h-[40%] bg-nude/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />

      <Suspense fallback={
        <div className="z-10 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Đang khởi tạo...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
