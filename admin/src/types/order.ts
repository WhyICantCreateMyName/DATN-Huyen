export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DELIVERING = "DELIVERING",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURN_REQUESTED = "RETURN_REQUESTED",
  RETURNED = "RETURNED"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  price: number;
  variant: {
    id: string;
    size: string;
    color: string;
    product: {
      id: string;
      name: string;
      images: string[];
    };
  };
}

export interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
