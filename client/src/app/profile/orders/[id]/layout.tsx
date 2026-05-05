import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chi tiết đơn hàng | Yuki Fashion',
  description: 'Xem chi tiết đơn hàng, trạng thái vận chuyển và thanh toán của bạn tại Yuki Fashion.',
};

export default function OrderDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
