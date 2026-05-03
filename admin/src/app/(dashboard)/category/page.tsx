import { CategoryListModule } from "@/components/category";

export const metadata = {
  title: "Quản lý danh mục | Yuki Admin",
  description: "Quản lý danh mục sản phẩm của cửa hàng",
};

export default function CategoryPage() {
  return <CategoryListModule />;
}
