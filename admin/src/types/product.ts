import { Category } from './category';
import { Collection } from './collection';

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
  slug: string;
  description?: string;
  images: string[];
  categoryId: string;
  category?: Category;
  variants: ProductVariant[];
  collections?: Collection[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
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
  collectionIds?: string[];
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
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
  collectionIds?: string[];
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
