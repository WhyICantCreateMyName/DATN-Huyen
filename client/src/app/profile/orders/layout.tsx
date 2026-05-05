import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đơn hàng của tôi | Yuki Fashion',
  description: 'Theo dõi lịch sử mua hàng và trạng thái đơn hàng của bạn tại Yuki Fashion.',
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
