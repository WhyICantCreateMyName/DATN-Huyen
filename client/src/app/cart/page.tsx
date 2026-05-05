import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import CartContainer from '@/components/cart/CartContainer';

export const metadata: Metadata = {
  title: "Giỏ hàng | Yuki Fashion",
  description: "Xem lại các sản phẩm bạn đã chọn và tiến hành thanh toán tại Yuki Fashion.",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CartContainer />
    </div>
  );
}
