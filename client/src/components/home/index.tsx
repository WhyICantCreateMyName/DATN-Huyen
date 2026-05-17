"use client";

import React from "react";
import BannerSection from "@/components/home/BannerSection";
import ProductCard from "@/components/product/ProductCard";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { productService } from "@/services/product.service";
import Link from "next/link";
import { useProduct } from "@/hooks/use-product";

export default function HomeComponent() {
  const { products, isLoading: productsLoading } = useProduct({ limit: 8 });

  return (
    <>
      <BannerSection />

      {/* BEST SELLERS Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="text-accent font-black text-xs uppercase tracking-[0.4em] mb-4 block">Most Wanted</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-tight">BEST <br /> SELLERS</h2>
          </div>
          <Link href={"/products"} className="group flex items-center gap-3 text-sm font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1 transition-all hover:gap-5">
            Xem tất cả <ArrowRight className="w-5 h-5 text-accent" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-slate-50 animate-pulse rounded-[2.5rem]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights */}
      <section className="py-20 bg-[#FBF9F6]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-nude/30 transition-transform hover:-translate-y-2 shadow-sm">
            <div className="w-16 h-16 bg-nude rounded-2xl flex items-center justify-center mb-6 text-black">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-3 text-black">GIAO HÀNG SIÊU TỐC</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Nhận hàng trong vòng 2h tại khu vực nội thành. Luôn đúng giờ, luôn tận tâm.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-nude/30 transition-transform hover:-translate-y-2 shadow-sm">
            <div className="w-16 h-16 bg-nude rounded-2xl flex items-center justify-center mb-6 text-black">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-3 text-black">TƯ VẤN AI THÔNG MINH</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Sử dụng trí tuệ nhân tạo để gợi ý phong cách phù hợp nhất với vóc dáng của bạn.</p>
          </div>
          <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-nude/30 transition-transform hover:-translate-y-2 shadow-sm">
            <div className="w-16 h-16 bg-nude rounded-2xl flex items-center justify-center mb-6 text-black">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-3 text-black">BẢO HÀNH TRỌN ĐỜI</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Cam kết chất lượng trên từng đường kim mũi chỉ. Đổi trả dễ dàng trong 30 ngày.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-nude rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-xl italic">Y</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              YUKI<span className="text-nude italic">FASHION</span>
            </span>
          </div>
          <p className="text-white/60 font-medium max-w-md mx-auto mb-10 leading-relaxed">
            Nâng tầm phong cách của bạn với những thiết kế đẳng cấp và dịch vụ tư vấn thông minh từ AI.
          </p>
          <div className="flex justify-center gap-10 mb-16">
            {['Facebook', 'Instagram', 'TikTok', 'Pinterest'].map(social => (
              <a key={social} href="#" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-nude transition-colors">{social}</a>
            ))}
          </div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">© 2026 YUKI FASHION GROUP. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </>
  );
}
