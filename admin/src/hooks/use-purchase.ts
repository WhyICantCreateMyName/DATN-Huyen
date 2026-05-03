import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { purchaseInvoiceService } from '@/services/purchase-invoice.service';
import { PurchaseType, QueryParams, PaginatedResponse } from '@/types';
import { useDebounce } from './use-debounce';

export const usePurchase = (params?: QueryParams) => {
  const debouncedSearch = useDebounce(params?.search, 700);

  const { data, error, isLoading, mutate: revalidate } = useSWR(
    ['purchase-invoices', { ...params, search: debouncedSearch }],
    async () => {
      const result = await purchaseInvoiceService.getInvoices({ ...params, search: debouncedSearch });
      return result.status === 200
        ? result.data.data as PaginatedResponse<PurchaseType.PurchaseInvoice>
        : { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data?.data || [],
    pagination: data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 },
    isLoading,
    isError: error,
    mutate: revalidate
  };
};

import { useToast } from '@/contexts/ToastProvider';

export const usePurchaseActions = () => {
  const { toast } = useToast();

  const { trigger: createInvoice, isMutating: isCreating } = useSWRMutation(
    'createPurchaseInvoice',
    async (_key: string, { arg }: { arg: PurchaseType.CreatePurchaseInvoiceInput }) => {
      try {
        const result = await purchaseInvoiceService.createInvoice(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'purchase_invoices');
        toast({
          title: "Thành công",
          message: "Đã tạo hóa đơn nhập hàng",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể tạo hóa đơn nhập hàng",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: deleteInvoice, isMutating: isDeleting } = useSWRMutation(
    'deletePurchaseInvoice',
    async (_key: string, { arg }: { arg: string }) => {
      try {
        const result = await purchaseInvoiceService.deleteInvoice(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'purchase_invoices');
        toast({
          title: "Thành công",
          message: "Đã xóa hóa đơn nhập hàng",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể xóa hóa đơn nhập hàng",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    createInvoice,
    isCreating,
    deleteInvoice,
    isDeleting,
    mutate
  };
};
