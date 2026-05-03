import React from "react";
import { Metadata } from "next";
import { ProductListModule } from "@/components/product";

export const metadata: Metadata = {
  title: "Quản lý sản phẩm",
  description: "Danh sách sản phẩm và quản lý kho hàng",
};

export default function ProductsPage() {
  return (
    <ProductListModule />
  );
}
