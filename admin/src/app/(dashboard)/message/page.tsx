import { Metadata } from "next";
import { MessageModule } from "@/components/message";

export const metadata: Metadata = {
  title: "Tin nhắn | Yuki Admin",
  description: "Quản lý hội thoại và tư vấn khách hàng",
};

export default function MessagesPage() {
  return <MessageModule />;
}
