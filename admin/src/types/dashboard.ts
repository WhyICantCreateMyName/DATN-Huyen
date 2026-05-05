export interface DashboardStats {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    newUsers: number;
    totalReviews: number;
    averageRating: number;
    topRatedProducts: {
      name: string;
      rating: number;
      count: number;
    }[];
    conversionRate: number;
  };
  revenueData: {
    name: string;
    revenue: number;
    fullDate: string;
  }[];
  topProducts: {
    id: string;
    name: string;
    category: string;
    images: string[];
    sales: number;
    price: number;
  }[];
  recentActivities: {
    id: string;
    user: string;
    action: string;
    time: string;
    type: string;
  }[];
}
