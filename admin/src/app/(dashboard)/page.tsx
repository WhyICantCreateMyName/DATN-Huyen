"use client";

import React from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  ArrowUpRight,
  Plus,
  Zap,
  Sparkles,
  Loader2
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ReviewChart from "@/components/dashboard/ReviewChart";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useDashboard } from "@/hooks/use-dashboard";
import { Star } from "lucide-react";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    );
  }

  const { stats, revenueData, topProducts, recentActivities } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            Chào buổi sáng, Admin <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-sm">
            Hệ thống Yuki Fashion đang vận hành ổn định
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm shadow-sm hover:bg-zinc-50 transition-all flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <Zap className="w-4 h-4 text-amber-500" />
            AI Insights
          </button>
          <button className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-violet-500/25 hover:bg-violet-700 transition-all flex items-center gap-2 scale-105 active:scale-95">
            <Plus className="w-4 h-4" />
            Tạo đơn mới
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Tổng doanh thu"
          value={`${stats.totalRevenue.toLocaleString('vi-VN')}đ`}
          change="12.5%"
          isPositive={true}
          icon={TrendingUp}
          color="bg-violet-600"
        />
        <StatCard
          label="Tổng đơn hàng"
          value={stats.totalOrders.toLocaleString('vi-VN')}
          change="8.2%"
          isPositive={true}
          icon={ShoppingBag}
          color="bg-emerald-500"
        />
        <StatCard
          label="Khách hàng"
          value={stats.totalUsers.toLocaleString('vi-VN')}
          change={`+${stats.newUsers}`}
          isPositive={true}
          icon={Users}
          color="bg-amber-500"
        />
        <StatCard
          label="Đánh giá trung bình"
          value={`${stats.averageRating || 0}/5`}
          change={`${stats.totalReviews || 0} lượt`}
          isPositive={true}
          icon={Star}
          color="bg-rose-500"
        />
      </div>

      {/* Main Charts & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <RevenueChart data={revenueData} />
        </div>
        <div className="lg:col-span-1">
          <ReviewChart data={stats.topRatedProducts || []} />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed activities={recentActivities} />
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] group hover:border-violet-500/50 transition-all">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">Sản phẩm bán chạy</h3>
            <button className="text-violet-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Tất cả <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-6">
            {topProducts.map((product, i) => (
              <div key={product.id} className="flex items-center gap-4 group/item cursor-pointer">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border border-zinc-200/50 dark:border-zinc-800">
                  <img
                    src={product.images[0] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.id}`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-zinc-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mt-0.5">{product.category} • {product.sales} đơn hàng</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-zinc-900 dark:text-white">{product.price.toLocaleString('vi-VN')}đ</p>
                  <p className="text-[10px] font-black text-emerald-500 uppercase mt-0.5">+15%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-1 rounded-[2.5rem] shadow-xl shadow-violet-500/20">
          <div className="bg-white/5 dark:bg-zinc-950/50 backdrop-blur-xl h-full w-full rounded-[2.35rem] p-8 flex flex-col justify-between text-white border border-white/10">
            <div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
              </div>
              <h3 className="text-2xl font-black leading-tight mb-3">AI Insight: Xu hướng tuần tới</h3>
              <p className="text-white/70 font-medium leading-relaxed">
                Dựa trên dữ liệu thực tế 30 ngày qua, doanh thu của bạn đang tăng trưởng ổn định. Các sản phẩm {topProducts[0]?.name || 'mới'} đang thu hút sự chú ý lớn từ khách hàng.
              </p>
            </div>
            <button className="mt-8 py-4 px-8 bg-white text-violet-600 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20">
              Xem báo cáo chi tiết AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
