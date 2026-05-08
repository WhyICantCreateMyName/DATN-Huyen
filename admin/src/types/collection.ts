export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products?: any[];
  _count?: {
    products: number;
  };
}

export interface CreateCollectionInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  productIds?: string[];
}

export interface UpdateCollectionInput {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  productIds?: string[];
}
