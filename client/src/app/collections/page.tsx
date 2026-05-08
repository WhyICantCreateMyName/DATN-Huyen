"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import { useCollections } from "@/hooks/use-collection";
import CollectionCard from "@/components/collection/CollectionCard";
import { Sparkles } from "lucide-react";

export default function CollectionsPage() {
  const { collections, isLoading } = useCollections({ limit: 20 });

  return (
    <main className="relative bg-white min-h-screen">
      <Navbar />
      
      <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-nude flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <span className="text-accent font-black text-xs uppercase tracking-[0.4em]">Curated Series</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              OUR <br /> COLLECTIONS
            </h1>
          </div>
          <p className="text-slate-400 font-medium text-lg max-w-sm leading-relaxed">
            Khám phá những câu chuyện thời trang được kể qua từng bộ sưu tập độc bản, kết hợp giữa nghệ thuật và phong cách hiện đại.
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[16/9] bg-slate-50 animate-pulse rounded-[3rem]" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="py-40 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-black uppercase tracking-widest">Hiện chưa có bộ sưu tập nào được công khai</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12">
            {collections.filter(c => c.isActive).map(collection => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>

      {/* Footer (Simplified) */}
      <footer className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">© 2026 YUKI FASHION GROUP. ARTICULATED BY AI.</p>
        </div>
      </footer>
    </main>
  );
}
