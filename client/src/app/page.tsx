import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import HomeModule from "@/components/home";

export const metadata: Metadata = {
  title: "Yuki Fashion | Nâng Tầm Phong Cách Với AI Stylist",
  description: "Khám phá bộ sưu tập thời trang đẳng cấp và trải nghiệm dịch vụ tư vấn phong cách cá nhân thông minh từ AI Stylist tại Yuki Fashion.",
  openGraph: {
    title: "Yuki Fashion - Thời Trang Luxury & AI Stylist",
    description: "Trải nghiệm mua sắm thời trang thế hệ mới với sự hỗ trợ của trí tuệ nhân tạo.",
    images: ["/og-image.jpg"],
  },
};

export default function Home() {
  return (
    <main className="relative bg-white min-h-screen">
      <Navbar />
      <HomeModule />
    </main>
  );
}
