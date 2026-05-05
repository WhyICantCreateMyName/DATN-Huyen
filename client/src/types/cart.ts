import { Product, ProductVariant } from './product';

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  variant: ProductVariant & { product: Pick<Product, 'id' | 'name' | 'images'> };
  createdAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface AddToCartInput {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}
