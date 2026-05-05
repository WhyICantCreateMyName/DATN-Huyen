import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';
import { bannerService } from '@/services/banner.service';
import { BannerType, QueryParams } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export const useBanner = (params?: QueryParams) => {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    ['banners', params],
    async () => {
      const result = await bannerService.getAdminBanners();
      // Banner sliders currently don't use server-side pagination in the controller, 
      // but we'll return the data array to match the pattern.
      return result.status === 200 ? result.data.data : [];
    },
    {
      revalidateOnFocus: false,
    }
  );

  return {
    data: data || [],
    isLoading,
    isError: error,
    mutate: revalidate
  };
};

export const useBannerActions = () => {
  const { toast } = useToast();

  const { trigger: createBanner, isMutating: isCreating } = useSWRMutation(
    'createBanner',
    async (_key: string, { arg }: { arg: BannerType.CreateBannerSliderInput }) => {
      try {
        const result = await bannerService.createBanner(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'banners');
        toast({
          title: "Thành công",
          message: "Đã tạo Slider mới",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể tạo Slider",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: updateBanner, isMutating: isUpdating } = useSWRMutation(
    'updateBanner',
    async (_key: string, { arg }: { arg: { id: string; data: Partial<BannerType.CreateBannerSliderInput> } }) => {
      try {
        const result = await bannerService.updateBanner(arg.id, arg.data);
        mutate((key: any) => Array.isArray(key) && key[0] === 'banners');
        toast({
          title: "Thành công",
          message: "Đã cập nhật Slider",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể cập nhật Slider",
          variant: "error"
        });
        throw err;
      }
    }
  );

  const { trigger: deleteBanner, isMutating: isDeleting } = useSWRMutation(
    'deleteBanner',
    async (_key: string, { arg }: { arg: string }) => {
      try {
        const result = await bannerService.deleteBanner(arg);
        mutate((key: any) => Array.isArray(key) && key[0] === 'banners');
        toast({
          title: "Thành công",
          message: "Đã xóa Slider",
          variant: "success"
        });
        return result.status;
      } catch (err) {
        toast({
          title: "Lỗi",
          message: "Không thể xóa Slider",
          variant: "error"
        });
        throw err;
      }
    }
  );

  return {
    createBanner,
    isCreating,
    updateBanner,
    isUpdating,
    deleteBanner,
    isDeleting
  };
};
