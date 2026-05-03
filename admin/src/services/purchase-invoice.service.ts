import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { ApiResponse, PurchaseType, QueryParams, PaginatedResponse } from '@/types';

export const purchaseInvoiceService = {
  getInvoices: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<PurchaseType.PurchaseInvoice>>>> => {
    return axios.get('/admin/purchase-invoices', { params });
  },

  getInvoice: (id: string): Promise<AxiosResponse<ApiResponse<PurchaseType.PurchaseInvoice>>> => {
    return axios.get(`/admin/purchase-invoices/${id}`);
  },

  createInvoice: (data: PurchaseType.CreatePurchaseInvoiceInput): Promise<AxiosResponse<ApiResponse<PurchaseType.PurchaseInvoice>>> => {
    return axios.post('/admin/purchase-invoices', data);
  },

  updateInvoice: (id: string, data: PurchaseType.UpdatePurchaseInvoiceInput): Promise<AxiosResponse<ApiResponse<PurchaseType.PurchaseInvoice>>> => {
    return axios.put(`/admin/purchase-invoices/${id}`, data);
  },

  deleteInvoice: (id: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.delete(`/admin/purchase-invoices/${id}`);
  }
};
