import useSWR from 'swr';
import { orderService } from '@/services/order.service';
import { OrderType } from '@/types';

export const useOrders = () => {
  const { data, error, isLoading, mutate } = useSWR(
    'orders',
    async () => {
      const result = await orderService.getOrders();
      return result.data.data as OrderType.Order[];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    orders: data || [],
    isLoading,
    isError: error,
    mutate
  };
};

export const useOrderDetail = (id: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `order-${id}` : null,
    async () => {
      const result = await orderService.getOrderDetail(id);
      return result.data.data as OrderType.Order;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    order: data,
    isLoading,
    isError: error,
    mutate
  };
};

import useSWRMutation from 'swr/mutation';
import { useToast } from '@/contexts/ToastContext';
import { mutate as globalMutate } from 'swr';

export const useCreateOrder = () => {
  const { toast } = useToast();

  const { trigger: createOrder, isMutating: isCreating } = useSWRMutation(
    'orders',
    async (_key: string, { arg }: { arg: any }) => {
      try {
        const result = await orderService.createOrder(arg);

        globalMutate('orders');
        globalMutate('cart');

        return result.data;
      } catch (err: any) {
        toast({
          title: "Lỗi",
          message: err.response?.data?.message || "Không thể tạo đơn hàng",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    createOrder,
    isCreating
  };
};
