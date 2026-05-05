import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import CheckoutContainer from "@/components/checkout/CheckoutContainer";

export const metadata: Metadata = {
  title: "Thanh toán | Yuki Fashion",
  description: "Hoàn tất đơn hàng của bạn tại Yuki Fashion.",
};

export default function CheckoutPage() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <CheckoutContainer />
    </div>
  );
}
