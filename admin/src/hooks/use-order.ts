import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { orderService } from '@/services/order.service';
import { Order, OrderStatus, PaymentStatus } from '@/types/order';
import { QueryParams, PaginatedResponse } from '@/types';
import { useDebounce } from './use-debounce';

export const useOrder = (params?: QueryParams) => {
  const debouncedSearch = useDebounce(params?.search, 700);

  const { data, error, isLoading, mutate: revalidate } = useSWR(
    ['orders', { ...params, search: debouncedSearch }],
    async () => {
      const result = await orderService.getOrders({ ...params, search: debouncedSearch });
      return result.status === 200
        ? result.data.data as PaginatedResponse<Order>
        : { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
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

export const useOrderActions = () => {
  const { toast } = useToast();

  const { trigger: updateOrderStatus, isMutating: isUpdatingStatus } = useSWRMutation(
    'updateOrderStatus',
    async (_key: string, { arg }: { arg: { id: string; status: OrderStatus } }) => {
      try {
        const result = await orderService.updateOrderStatus(arg.id, arg.status);
        mutate((key: any) => Array.isArray(key) && key[0] === 'orders');
        toast({
          title: "Thành công",
          message: "Đã cập nhật trạng thái đơn hàng",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể cập nhật trạng thái đơn hàng",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: updatePaymentStatus, isMutating: isUpdatingPayment } = useSWRMutation(
    'updatePaymentStatus',
    async (_key: string, { arg }: { arg: { id: string; status: PaymentStatus } }) => {
      try {
        const result = await orderService.updatePaymentStatus(arg.id, arg.status);
        mutate((key: any) => Array.isArray(key) && key[0] === 'orders');
        toast({
          title: "Thành công",
          message: "Đã cập nhật trạng thái thanh toán",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể cập nhật trạng thái thanh toán",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: deleteOrder, isMutating: isDeleting } = useSWRMutation(
    'deleteOrder',
    async (_key: string, { arg }: { arg: string }) => {
      try {
        const result = await orderService.deleteOrder(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'orders');
        toast({
          title: "Thành công",
          message: "Đã xóa đơn hàng",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể xóa đơn hàng",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    updateOrderStatus,
    isUpdatingStatus,
    updatePaymentStatus,
    isUpdatingPayment,
    deleteOrder,
    isDeleting,
    mutate
  };
};
