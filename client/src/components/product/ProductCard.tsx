"use client";

import React from "react";
import { ProductType } from "@/types";
import { ShoppingBag, Gem, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductCardProps {
  product: ProductType.Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const isLiked = isInWishlist(product.id);
  
  // Find min price and first variant
  const prices = product.variants?.map(v => v.price) || [0];
  const minPrice = Math.min(...prices);
  const firstVariant = product.variants?.[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (firstVariant) {
      addItem(firstVariant, 1);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <Link href={`/product/${product.slug || product.id}`} className="group cursor-pointer">
      <div className="aspect-[3/4] bg-slate-100 rounded-[2.5rem] mb-6 overflow-hidden relative shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
        {/* Hover Actions */}
        <div className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg scale-0 transition-transform duration-500 group-hover:scale-100 z-10">
          <ShoppingBag className="w-5 h-5 text-indigo-600" />
        </div>

        {/* Product Image */}
        <img
          src={product.images[0] || "/placeholder-product.png"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <span className="bg-white/90 backdrop-blur-md text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm border border-slate-100">New</span>
          <span className="bg-nude text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">Premium</span>
        </div>

        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3">
          <button 
            onClick={handleAddToCart}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-xl hover:bg-nude transition-colors duration-300"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
          <button 
            onClick={handleToggleWishlist}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-300",
              isLiked ? "bg-rose-500 text-white" : "bg-white text-black hover:bg-rose-50"
            )}
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          </button>
        </div>
      </div>

      <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">
        {product.category?.name || "Yuki Collection"}
      </p>
      <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-accent transition-colors line-clamp-1">
        {product.name}
      </h3>
      <p className="text-lg font-bold text-slate-400">
        {minPrice > 0 ? `${minPrice.toLocaleString('vi-VN')}đ` : "Liên hệ"}
      </p>
    </Link>
  );
}
