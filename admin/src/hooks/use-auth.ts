import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import Cookies from 'js-cookie';
import { authService } from '@/services/auth.service';
import { AuthType } from '@/types';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/services/axios';

export const useAuth = () => {
  return useSWR(
    'auth_me',
    async () => {
      const result = await authService.getCurrentUser();
      return result.status === 200 ? result.data.data as AuthType.User : null;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
};

import { useToast } from '@/contexts/ToastProvider';

export const useAuthActions = () => {
  const { toast } = useToast();
  const { trigger: login, isMutating: isLoggingIn } = useSWRMutation(
    'login',
    async (_key: string, { arg }: { arg: AuthType.LoginInput }) => {
      try {
        const result = await authService.login(arg);
        if (result.status === 200) {
          const { user, token, refreshToken } = result.data.data as AuthType.AuthResponse;
          
          if (user.role !== 'ADMIN') {
            toast({
              title: "Từ chối truy cập",
              message: "Bạn không có quyền truy cập hệ thống quản trị.",
              variant: "error"
            });
            const error: any = new Error("Forbidden");
            error.response = { status: 403 };
            throw error;
          }

          Cookies.set(TOKEN_KEY, token, { expires: 7 });
          Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7 });
          await mutate('auth_me');
          toast({
            title: "Thành công",
            message: "Chào mừng quay trở lại!",
            variant: "success"
          });
        }
        return result.status;
      } catch (err: any) {
        if (err.response?.status !== 403) {
          toast({
            title: "Lỗi đăng nhập",
            message: err.response?.data?.message || "Email hoặc mật khẩu không đúng",
            variant: "error"
          });
        }
        throw err;
      }
    }
  );

  const { trigger: register, isMutating: isRegistering } = useSWRMutation(
    'register',
    async (_key: string, { arg }: { arg: AuthType.RegisterInput }) => {
      try {
        const result = await authService.register(arg);
        toast({
          title: "Thành công",
          message: "Đã tạo tài khoản thành công",
          variant: "success"
        });
        return result.status;
      } catch (err: any) {
        toast({
          title: "Lỗi đăng ký",
          message: err.response?.data?.message || "Không thể tạo tài khoản",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const logout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Đã đăng xuất",
        message: "Hẹn gặp lại bạn sớm!",
        variant: "success"
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      Cookies.remove(TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_KEY);
      await mutate('auth_me', null, false);
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  return {
    login,
    isLoggingIn,
    register,
    isRegistering,
    logout,
    mutate
  };
};
