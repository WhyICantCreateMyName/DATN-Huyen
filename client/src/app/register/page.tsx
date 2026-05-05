import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: "Đăng ký | Yuki Fashion",
  description: "Tạo tài khoản Yuki Fashion để nhận các ưu đãi đặc quyền và theo dõi đơn hàng của bạn.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nude/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />

      <RegisterForm />
    </div>
  );
}
