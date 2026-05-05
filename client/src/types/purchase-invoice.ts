export interface PurchaseInvoiceItem {
  id: string;
  invoiceId: string;
  variantId: string;
  quantity: number;
  costPrice: number;
  variant: any; // Simplified for now
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  totalAmount: number;
  notes?: string;
  items: PurchaseInvoiceItem[];
  createdAt: string;
}

export interface CreatePurchaseInvoiceInput {
  invoiceNumber: string;
  supplierName: string;
  notes?: string;
  items: {
    variantId: string;
    quantity: number;
    costPrice: number;
  }[];
}

export interface UpdatePurchaseInvoiceInput {
  supplierName?: string;
  notes?: string;
}
