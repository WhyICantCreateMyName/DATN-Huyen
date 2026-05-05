import useSWR from 'swr';
import { cartService } from '@/services/cart.service';
import { CartType, ApiResponse } from '@/types';
import { AxiosResponse } from 'axios';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

export const useCart = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: response, error, mutate, isLoading } = useSWR<AxiosResponse<ApiResponse<CartType.Cart>>>(
    isAuthenticated ? 'cart' : null,
    () => cartService.getCart()
  );

  const cart = response?.status === 200 ? (response.data.data as CartType.Cart) : null;

  const addToCart = async (data: CartType.AddToCartInput) => {
    if (!isAuthenticated) {
      toast({
        title: "Yêu cầu đăng nhập",
        message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
        variant: "warning"
      });
      return 401;
    }

    try {
      const res = await cartService.addToCart(data);
      if (res.status === 200 || res.status === 201) {
        await mutate();
        toast({
          title: "Thành công",
          message: "Đã thêm vào giỏ hàng",
          variant: "success"
        });
      }
      return res.status;
    } catch (err: any) {
      toast({
        title: "Lỗi",
        message: err.response?.data?.message || "Không thể thêm vào giỏ hàng",
        variant: "error"
      });
      throw err;
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const res = await cartService.updateQuantity(id, { quantity });
      if (res.status === 200) {
        await mutate();
      }
      return res.status;
    } catch (err: any) {
      toast({
        title: "Lỗi",
        message: err.response?.data?.message || "Không thể cập nhật số lượng",
        variant: "error"
      });
      throw err;
    }
  };

  const removeItem = async (id: string) => {
    try {
      const res = await cartService.removeItem(id);
      if (res.status === 200) {
        await mutate();
        toast({
          title: "Thành công",
          message: "Đã xóa khỏi giỏ hàng",
          variant: "success"
        });
      }
      return res.status;
    } catch (err: any) {
      toast({
        title: "Lỗi",
        message: err.response?.data?.message || "Không thể xóa sản phẩm",
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
    mutate
  };
};
