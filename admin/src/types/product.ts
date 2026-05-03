import { Category } from './category';

export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  price: number;
  stock: number;
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
