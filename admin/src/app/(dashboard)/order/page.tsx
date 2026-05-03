import React from "react";
import { Metadata } from "next";
import { OrderListModule } from "@/components/order";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng",
  description: "Danh sách đơn hàng và quản lý quy trình xử lý đơn",
};

export default function OrdersPage() {
  return (
    <OrderListModule />
  );
}
