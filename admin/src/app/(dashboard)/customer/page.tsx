import { Metadata } from "next";
import CustomerListModule from "@/components/customer";

export const metadata: Metadata = {
  title: "Quản lý khách hàng | DANT Huyen Admin",
  description: "Quản lý thông tin và lịch sử mua hàng của khách hàng",
};

export default function CustomerPage() {
  return <CustomerListModule />;
}
