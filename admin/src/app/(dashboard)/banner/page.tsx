import BannerModule from "@/components/banner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Banner | Yuki Admin",
  description: "Quản lý nội dung quảng cáo và banner cho trang thương mại điện tử.",
};

export default function BannerPage() {
  return <BannerModule />;
}
