import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: "Quên mật khẩu | Yuki Fashion",
  description: "Khôi phục quyền truy cập vào tài khoản Yuki Fashion của bạn một cách an toàn.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-nude/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />

      <ForgotPasswordForm />
    </div>
  );
}
