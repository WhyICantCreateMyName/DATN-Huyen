"use client";

import React from "react";
import { CollectionType } from "@/types";
import { ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  collection: CollectionType.Collection;
  className?: string;
}

export default function CollectionCard({ collection, className }: CollectionCardProps) {
  return (
    <Link href={`/collections/${collection.slug || collection.id}`} className={cn("group relative block overflow-hidden rounded-[3rem] bg-slate-100 aspect-[16/9] shadow-sm hover:shadow-2xl transition-all duration-700", className)}>
      {/* Background Image */}
      <img
        src={collection.image || "/placeholder-collection.jpg"}
        alt={collection.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Content */}
      <div className="absolute inset-0 p-10 flex flex-col justify-end">
        <div className="flex items-center gap-3 mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
            <Package className="w-5 h-5 text-nude" />
          </div>
          <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">
            {collection._count?.products || 0} Sản phẩm
          </span>
        </div>
        
        <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 uppercase italic">
          {collection.name}
        </h3>
        
        <p className="text-white/60 text-sm font-medium max-w-md line-clamp-2 mb-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">
          {collection.description || "Khám phá phong cách thời trang đẳng cấp trong bộ sưu tập mới nhất từ Yuki Fashion."}
        </p>

        <div className="flex items-center gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-200">
          <span className="bg-nude text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
            Khám phá ngay <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 flex flex-col gap-2 items-end">
        <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-10 group-hover:translate-x-0">
          Limited Edition
        </span>
      </div>
    </Link>
  );
}
