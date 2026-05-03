export * as AuthType from './auth';
export * as CategoryType from './category';
export * as ProductType from './product';
export * as CartType from './cart';
export * as OrderType from './order';
export * as ChatType from './chat';
export * as MessageType from './message';
export * as PurchaseType from './purchase-invoice';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: string;
  [key: string]: any;
}

