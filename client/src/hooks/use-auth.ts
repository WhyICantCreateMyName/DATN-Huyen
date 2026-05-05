import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import Cookies from 'js-cookie';
import { authService } from '@/services/auth.service';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/services/axios';
import { AuthType } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export const useAuth = () => {
  const { data, error, isLoading, mutate: mutateProfile } = useSWR(
    TOKEN_KEY,
    async () => {
      const token = Cookies.get(TOKEN_KEY);
      if (!token) return null;
      try {
        const res = await authService.getMe();
        return res.data.data;
      } catch (error) {
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(REFRESH_TOKEN_KEY);
        Cookies.remove('user');
        return null;
      }
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      fallbackData: (() => {
        if (typeof window === 'undefined') return null;
        const savedUser = Cookies.get('user');
        return savedUser ? JSON.parse(savedUser) : null;
      })(),
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate: mutateProfile,
  };
};

export const useAuthActions = () => {
  const { toast } = useToast();

  const { trigger: login, isMutating: isLoggingIn } = useSWRMutation(
    'auth/login',
    async (_url: string, { arg }: { arg: AuthType.LoginInput }) => {
      try {
        const res = await authService.login(arg);
        const { token, refreshToken, user: userData } = res.data.data;

        Cookies.set(TOKEN_KEY, token, { expires: 7 });
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 30 });
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });

        await mutate(TOKEN_KEY);

        toast({
          title: "Chào mừng trở lại",
          message: "Đăng nhập thành công. Chúc bạn một ngày mua sắm tuyệt vời!",
          variant: "success"
        });

        return res.status;
      } catch (error: any) {
        const status = error.response?.status;
        let errorMessage = error.response?.data?.message || "Đã có lỗi xảy ra.";

        if (status === 401) errorMessage = "Email hoặc mật khẩu không chính xác.";
        else if (status === 404) errorMessage = "Tài khoản không tồn tại.";

        toast({
          title: "Lỗi đăng nhập",
          message: errorMessage,
          variant: "error"
        });
        throw error;
      }
    }
  );

  const { trigger: register, isMutating: isRegistering } = useSWRMutation(
    'auth/register',
    async (_url: string, { arg }: { arg: AuthType.RegisterInput }) => {
      try {
        const res = await authService.register(arg);
        const { token, refreshToken, user: userData } = res.data.data;

        Cookies.set(TOKEN_KEY, token, { expires: 7 });
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 30 });
        Cookies.set('client_user', JSON.stringify(userData), { expires: 7 });

        await mutate(TOKEN_KEY);

        toast({
          title: "Chào mừng bạn",
          message: "Tài khoản của bạn đã được tạo thành công!",
          variant: "success"
        });

        return res.status;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Đăng ký thất bại.";
        toast({
          title: "Lỗi đăng ký",
          message: errorMessage,
          variant: "error"
        });
        throw error;
      }
    }
  );

  const logout = async () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    Cookies.remove('user');
    await mutate(TOKEN_KEY, null, false);
    toast({
      title: "Đã đăng xuất",
      message: "Hẹn gặp lại bạn sớm nhất!",
      variant: "info"
    });
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await authService.forgotPassword(email);
      return res;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        message: error.response?.data?.message || "Không thể gửi yêu cầu khôi phục.",
        variant: "error"
      });
      throw error;
    }
  };

  const resetPassword = async (data: any) => {
    try {
      const res = await authService.resetPassword(data);
      toast({
        title: "Thành công",
        message: "Mật khẩu của bạn đã được đặt lại.",
        variant: "success"
      });
      return res;
    } catch (error: any) {
      toast({
        title: "Lỗi",
        message: error.response?.data?.message || "Không thể đặt lại mật khẩu.",
        variant: "error"
      });
      throw error;
    }
  };

  const { trigger: updateProfile, isMutating: isUpdatingProfile } = useSWRMutation(
    'auth/profile',
    async (_url: string, { arg }: { arg: AuthType.UpdateUserInput }) => {
      try {
        const res = await authService.updateProfile(arg);
        const userData = res.data.data;

        Cookies.set('client_user', JSON.stringify(userData), { expires: 7 });
        await mutate(TOKEN_KEY);

        toast({
          title: "Cập nhật thành công",
          message: "Thông tin cá nhân của bạn đã được lưu lại.",
          variant: "success"
        });

        return res.status;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Cập nhật thất bại.";
        toast({
          title: "Lỗi cập nhật",
          message: errorMessage,
          variant: "error"
        });
        throw error;
      }
    }
  );

  return {
    login,
    isLoggingIn,
    register,
    isRegistering,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isUpdatingProfile,
  };
};
