import axios from '@/services/axios';
import { AxiosResponse } from 'axios';
import { ApiResponse, QueryParams, PaginatedResponse, CustomerType } from '@/types';

export const customerService = {
  getCustomers: (params?: QueryParams): Promise<AxiosResponse<ApiResponse<PaginatedResponse<CustomerType.Customer>>>> => {
    return axios.get('/admin/customers', { params });
  },

  createCustomer: (data: CustomerType.CreateCustomerInput): Promise<AxiosResponse<ApiResponse<CustomerType.Customer>>> => {
    return axios.post('/admin/customers', data);
  },

  updateCustomer: (id: string, data: CustomerType.UpdateCustomerInput): Promise<AxiosResponse<ApiResponse<CustomerType.Customer>>> => {
    return axios.put(`/admin/customers/${id}`, data);
  },

  deleteCustomer: (id: string): Promise<AxiosResponse<ApiResponse<any>>> => {
    return axios.delete(`/admin/customers/${id}`);
  }
};
