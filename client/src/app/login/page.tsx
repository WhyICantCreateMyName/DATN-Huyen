import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: "Đăng nhập | Yuki Fashion",
  description: "Đăng nhập vào tài khoản Yuki Fashion của bạn để trải nghiệm mua sắm cá nhân hóa.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-nude/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />

      <LoginForm />
    </div>
  );
}
