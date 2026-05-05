export interface BannerItem {
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  backgroundColor?: string;
  accentColor?: string;
}

export interface BannerSlider {
  id: string;
  name: string;
  items: BannerItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerSliderInput {
  name: string;
  items: BannerItem[];
  isActive?: boolean;
}
