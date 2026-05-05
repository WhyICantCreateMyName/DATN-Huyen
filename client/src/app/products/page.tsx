import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import ProductsModule from "@/components/product";

export const metadata: Metadata = {
  title: "Danh Sách Sản Phẩm | Yuki Fashion - Thời Trang Đẳng Cấp",
  description: "Duyệt qua bộ sưu tập thời trang mới nhất tại Yuki Fashion. Tìm kiếm và lọc sản phẩm theo danh mục, giá cả và phong cách.",
  openGraph: {
    title: "Sản Phẩm Yuki Fashion - Chất Lượng & Đẳng Cấp",
    description: "Bộ sưu tập thời trang cao cấp được tuyển chọn kỹ lưỡng cho phong cách riêng của bạn.",
    images: ["/og-products.jpg"],
  },
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <ProductsModule />
    </main>
  );
}
