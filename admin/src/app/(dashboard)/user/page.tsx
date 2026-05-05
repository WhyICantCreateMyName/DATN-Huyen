import { Metadata } from "next";
import UserListModule from "@/components/user";

export const metadata: Metadata = {
  title: "Quản lý tài khoản | Yuki Fashion Admin",
  description: "Quản trị viên và nhân viên hệ thống",
};

export default function UserPage() {
  return <UserListModule />;
}
