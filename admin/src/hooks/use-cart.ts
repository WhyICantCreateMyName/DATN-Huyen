import useSWR from 'swr';
import { cartService } from '@/services/cart.service';
import { CartType, ApiResponse } from '@/types';
import { AxiosResponse } from 'axios';
import { useToast } from '@/contexts/ToastProvider';

export const useCart = () => {
  const { toast } = useToast();
  const { data: response, error, mutate, isLoading } = useSWR<AxiosResponse<ApiResponse<CartType.Cart>>>(
    'cart', 
    () => cartService.getCart()
  );

  const cart = response?.status === 200 ? (response.data.data as CartType.Cart) : null;

  const addToCart = async (data: CartType.AddToCartInput) => {
    try {
      const res = await cartService.addToCart(data);
      if (res.status === 200 || res.status === 201) {
        await mutate(res, { revalidate: false });
        toast({
          title: "Thành công",
          message: "Đã thêm vào giỏ hàng",
          variant: "success"
        });
      }
      return res.status;
    } catch (err) {
      toast({
        title: "Lỗi",
        message: "Không thể thêm vào giỏ hàng",
        variant: "error"
      });
      throw err;
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const res = await cartService.updateQuantity(id, { quantity });
      if (res.status === 200) {
        await mutate(res, { revalidate: false });
        toast({
          title: "Thành công",
          message: "Đã cập nhật số lượng",
          variant: "success"
        });
      }
      return res.status;
    } catch (err) {
      toast({
        title: "Lỗi",
        message: "Không thể cập nhật số lượng",
        variant: "error"
      });
      throw err;
    }
  };

  const removeItem = async (id: string) => {
    try {
      const res = await cartService.removeItem(id);
      if (res.status === 200) {
        await mutate(res, { revalidate: false });
        toast({
          title: "Thành công",
          message: "Đã xóa khỏi giỏ hàng",
          variant: "success"
        });
      }
      return res.status;
    } catch (err) {
      toast({
        title: "Lỗi",
        message: "Không thể xóa sản phẩm",
        variant: "error"
      });
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      const res = await cartService.clearCart();
      if (res.status === 200) {
        await mutate(undefined, { revalidate: false });
        toast({
          title: "Thành công",
          message: "Đã làm trống giỏ hàng",
          variant: "success"
        });
      }
      return res.status;
    } catch (err) {
      toast({
        title: "Lỗi",
        message: "Không thể làm trống giỏ hàng",
        variant: "error"
      });
      throw err;
    }
  };

  return {
    cart,
    items: cart?.items || [],
    totalAmount: cart?.totalAmount || 0,
    totalItems: cart?.totalItems || 0,
    isLoading,
    isError: error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    mutate
  };
};
