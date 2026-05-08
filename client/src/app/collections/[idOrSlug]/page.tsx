"use client";

import React from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useCollection } from "@/hooks/use-collection";
import ProductCard from "@/components/product/ProductCard";
import { ArrowLeft, LayoutGrid, PackageOpen } from "lucide-react";
import Link from "next/link";

export default function CollectionDetailPage() {
  const params = useParams();
  const idOrSlug = params.idOrSlug as string;
  const { collection, isLoading } = useCollection(idOrSlug);

  if (isLoading) {
    return (
      <main className="bg-white min-h-screen">
        <Navbar />
        <div className="pt-40 flex flex-col items-center justify-center gap-6">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-accent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Đang khởi tạo phong cách...</p>
        </div>
      </main>
    );
  }

  if (!collection) {
    return (
      <main className="bg-white min-h-screen">
        <Navbar />
        <div className="pt-40 text-center">
          <h1 className="text-4xl font-black mb-4">KHÔNG TÌM THẤY BỘ SƯU TẬP</h1>
          <Link href="/collections" className="text-accent font-bold hover:underline">Quay lại danh sách</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative bg-white min-h-screen">
      <Navbar />

      {/* Hero Header */}
      <div className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <img
          src={collection.image || "/placeholder-collection.jpg"}
          className="absolute inset-0 w-full h-full object-cover"
          alt={collection.name}
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

        <div className="relative z-10 text-center px-6 max-w-4xl animate-in fade-in zoom-in duration-700">
          <Link href="/collections" className="inline-flex items-center gap-2 text-[10px] font-black text-white/60 uppercase tracking-widest mb-8 hover:text-nude transition-colors">
            <ArrowLeft className="w-4 h-4" /> Trở về danh sách
          </Link>
          <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase italic leading-tight mb-6">
            {collection.name}
          </h1>
          <p className="text-white/70 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto italic">
            {collection.description || "Khám phá phong cách thời trang đẳng cấp trong bộ sưu tập mới nhất."}
          </p>
        </div>

        {/* Floating Stat */}
        <div className="absolute bottom-12 left-12 hidden md:flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-white">
          <div className="w-12 h-12 rounded-2xl bg-nude flex items-center justify-center text-black shadow-lg shadow-nude/20">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Sản phẩm hiện có</p>
            <p className="text-2xl font-black italic">{collection.products?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        {collection.products && collection.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {collection.products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center flex flex-col items-center gap-6 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
            <PackageOpen className="w-16 h-16 text-slate-200" />
            <div>
              <p className="text-lg font-bold text-slate-900 mb-2">BST ĐANG ĐƯỢC CẬP NHẬT</p>
              <p className="text-sm text-slate-400 font-medium">Chúng tôi đang chuẩn bị những sản phẩm tuyệt vời nhất cho bạn.</p>
            </div>
            <Link href="/collections" className="mt-4 px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10">
              Khám phá BST khác
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">© 2026 YUKI FASHION GROUP. CURATED BY AI TECHNOLOGY.</p>
        </div>
      </footer>
    </main>
  );
}
