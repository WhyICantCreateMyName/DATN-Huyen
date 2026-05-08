import { CollectionListModule } from "@/components/collection";

export const metadata = {
  title: "Quản lý bộ sưu tập | Yuki Admin",
  description: "Quản lý các bộ sưu tập sản phẩm của cửa hàng",
};

export default function CollectionPage() {
  return <CollectionListModule />;
}
