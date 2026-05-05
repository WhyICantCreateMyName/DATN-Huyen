import { PurchaseListModule } from "@/components/purchase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nhập hàng | Yuki Fashion Admin",
  description: "Quản lý hóa đơn nhập hàng và tồn kho sản phẩm",
};

export default function PurchasePage() {
  return (
    <PurchaseListModule />
  );
}
