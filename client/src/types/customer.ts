export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
