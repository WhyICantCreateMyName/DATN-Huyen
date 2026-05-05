import { Category } from './category';

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  product?: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  images: string[];
  categoryId: string;
  category?: Category;
  variants: ProductVariant[];
  reviews?: ProductReview[];
  reviewCount?: number;
  averageRating?: number;
  ratingDistribution?: Record<number, number>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  images: string[];
  categoryId: string;
  variants?: {
    id?: string;
    size: string;
    color: string;
    price: number;
    stock: number;
  }[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  images?: string[];
  categoryId?: string;
  variants?: {
    id?: string;
    size: string;
    color: string;
    price: number;
    stock: number;
  }[];
}

export interface CreateVariantInput {
  productId: string;
  size: string;
  color: string;
  price: number;
  stock: number;
}

export interface UpdateVariantInput {
  size?: string;
  color?: string;
  price?: number;
  stock?: number;
}
