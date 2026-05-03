import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập | Yuki Admin",
  description: "Truy cập vào hệ thống quản trị Yuki",
};

export default function LoginPage() {
  return <LoginForm />;
}
