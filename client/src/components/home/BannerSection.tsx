"use client";

import React from "react";
import useSWR from "swr";
import { bannerService } from "@/services/banner.service";
import { BannerType } from "@/types";
import BannerSlider from "./BannerSlider";

export default function BannerSection() {
  const { data: sliders, isLoading } = useSWR("banners", async () => {
    const res = await bannerService.getBanners();
    return res.data.data as unknown as BannerType.BannerSlider[];
  });

  if (isLoading) {
    return (
      <div className="w-full h-[25vh] bg-zinc-50 animate-pulse flex items-center justify-center mb-6">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
      </div>
    );
  }

  const activeSliders = sliders?.filter(s => s.isActive && s.items && s.items.length > 0) || [];

  if (activeSliders.length === 0) return null;

  // Only show the first active slider as the Hero Banner
  const heroSlider = activeSliders[0];

  return (
    <div className="flex flex-col">
      <BannerSlider items={heroSlider.items} />
    </div>
  );
}
