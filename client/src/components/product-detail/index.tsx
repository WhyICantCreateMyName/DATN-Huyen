"use client";

import React, { useState } from "react";
import { useProductDetail } from "@/hooks/use-product-detail";
import { useProduct } from "@/hooks/use-product";
import ProductCard from "@/components/product/ProductCard";
import {
  ShoppingBag,
  Heart,
  Share2,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  Plus,
  Minus,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { reviewService } from "@/services/review.service";
import { useAuth } from "@/contexts/AuthContext";
import TryOnModal from "@/components/product/TryOnModal";

interface ProductDetailComponentProps {
  idOrSlug: string;
}

export default function ProductDetailComponent({ idOrSlug }: ProductDetailComponentProps) {
  const { product, isLoading, isError, mutate } = useProductDetail(idOrSlug);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Thông báo", message: "Vui lòng đăng nhập để đánh giá.", variant: "warning" });
      return;
    }
    if (!reviewComment.trim()) {
      toast({ title: "Thông báo", message: "Vui lòng nhập nội dung đánh giá.", variant: "warning" });
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewService.createReview({
        productId: product!.id,
        rating: reviewRating,
        comment: reviewComment
      });
      toast({ title: "Thành công", message: "Cảm ơn bạn đã đánh giá sản phẩm!", variant: "success" });
      setReviewComment("");
      mutate(); // Refresh product data
    } catch (error) {
      toast({ title: "Lỗi", message: "Không thể gửi đánh giá.", variant: "error" });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast({
        title: "Thông báo",
        message: "Vui lòng chọn đầy đủ kích cỡ và màu sắc.",
        variant: "warning"
      });
      return;
    }

    const variant = product?.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
    if (variant) {
      if (variant.stock < quantity) {
        toast({
          title: "Lỗi",
          message: "Số lượng vượt quá tồn kho hiện có.",
          variant: "error"
        });
        return;
      }

      addItem(variant, quantity);
    }
  };

  // Fetch related products (same category)
  const { products: relatedProducts } = useProduct({
    categoryId: product?.categoryId,
    limit: 4
  });

  if (isLoading) return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-pulse">
        <div className="aspect-[4/5] bg-slate-100 rounded-[3rem]" />
        <div className="space-y-8">
          <div className="h-4 w-24 bg-slate-100 rounded" />
          <div className="h-16 w-full bg-slate-100 rounded" />
          <div className="h-8 w-32 bg-slate-100 rounded" />
          <div className="h-32 w-full bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );

  if (isError || !product) return (
    <div className="pt-40 pb-20 text-center">
      <h2 className="text-2xl font-black uppercase">Sản phẩm không tồn tại</h2>
      <p className="text-slate-500 mt-4">Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.</p>
    </div>
  );

  const images = product.images.length > 0 ? product.images : ["/placeholder-product.png"];
  const minPrice = Math.min(...(product.variants?.map(v => v.price) || [0]));

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-12">
        <a href="/" className="hover:text-black transition-colors">Trang chủ</a>
        <ChevronRight className="w-3 h-3" />
        <a href="/products" className="hover:text-black transition-colors">Sản phẩm</a>
        <ChevronRight className="w-3 h-3" />
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24">
        {/* Gallery */}
        <div className="space-y-6">
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-slate-50 group">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={images[selectedImage]}
                alt={product.name}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            <div className="absolute top-6 left-6">
              <span className="bg-nude text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">New Arrival</span>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  "w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all",
                  selectedImage === idx ? "border-black scale-105" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5 text-nude fill-nude">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3",
                      i <= (product.averageRating || 0) ? "fill-current" : "text-slate-200 fill-transparent"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                ({product.averageRating || 0} / {product.reviewCount || 0} Đánh giá)
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-black leading-tight mb-4 uppercase">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-accent">
              {(product?.variants?.find(v => v.size === selectedSize && v.color === selectedColor)?.price || minPrice).toLocaleString('vi-VN')} <span className="text-sm align-top mt-1 inline-block">₫</span>
            </p>
          </div>

          <div className="prose prose-slate mb-10">
            <p className="text-slate-500 font-medium leading-relaxed">
              {product.description || "Thiết kế tinh xảo từ bộ sưu tập mới nhất của Yuki Fashion, mang lại sự tự tin và đẳng cấp cho người mặc."}
            </p>
          </div>

          {/* Variants Selector */}
          <div className="space-y-8 mb-12">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Chọn kích cỡ</h4>
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200">Bảng size</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {Array.from(new Set(product.variants?.map(v => v.size))).sort((a, b) => {
                  const sizePriority: Record<string, number> = {
                    'FreeSize': 0, 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6, '2XL': 6, '3XL': 7, '4XL': 8
                  };

                  const pA = sizePriority[a.toUpperCase()] ?? (isNaN(Number(a)) ? 100 : Number(a));
                  const pB = sizePriority[b.toUpperCase()] ?? (isNaN(Number(b)) ? 100 : Number(b));

                  return pA - pB;
                }).map(size => {
                  // If a color is selected, check if this size is available for that color
                  const isAvailableForColor = selectedColor
                    ? product.variants?.some(v => v.size === size && v.color === selectedColor && v.stock > 0)
                    : product.variants?.some(v => v.size === size && v.stock > 0);

                  return (
                    <button
                      key={size}
                      disabled={!isAvailableForColor}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "w-14 h-14 rounded-2xl text-sm font-black transition-all flex items-center justify-center border",
                        selectedSize === size
                          ? "bg-black text-white border-black shadow-xl"
                          : "bg-white text-slate-400 border-slate-100 hover:border-black hover:text-black",
                        !isAvailableForColor && "opacity-20 cursor-not-allowed line-through"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Chọn màu sắc</h4>
              <div className="flex flex-wrap gap-3">
                {Array.from(new Set(product.variants?.map(v => v.color))).sort((a, b) => {
                  const colorPriority: Record<string, number> = {
                    'TRẮNG': 0, 'WHITE': 0, 'TRANG': 0,
                    'ĐEN': 1, 'BLACK': 1, 'DEN': 1,
                    'TÍM': 2, 'PURPLE': 2,
                    'CHÀM': 3, 'INDIGO': 3,
                    'XANH DƯƠNG': 4, 'BLUE': 4, 'LAM': 4,
                    'XANH LÁ': 5, 'GREEN': 5, 'LỤC': 5,
                    'VÀNG': 6, 'YELLOW': 6,
                    'CAM': 7, 'ORANGE': 7,
                    'ĐỎ': 8, 'RED': 8,
                  };

                  const pA = colorPriority[a.toUpperCase()] ?? 100;
                  const pB = colorPriority[b.toUpperCase()] ?? 100;

                  return pA - pB;
                }).map(color => {
                  // If a size is selected, check if this color is available for that size
                  const isAvailableForSize = selectedSize
                    ? product.variants?.some(v => v.color === color && v.size === selectedSize && v.stock > 0)
                    : product.variants?.some(v => v.color === color && v.stock > 0);

                  return (
                    <button
                      key={color}
                      disabled={!isAvailableForSize}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "px-6 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        selectedColor === color
                          ? "bg-black text-white border-black shadow-xl"
                          : "bg-white text-slate-400 border-slate-100 hover:border-black hover:text-black",
                        !isAvailableForSize && "opacity-20 cursor-not-allowed line-through"
                      )}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Số lượng</h4>
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-slate-100 rounded-2xl p-1 bg-slate-50/50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-black text-sm">{quantity}</span>
                  <button
                    onClick={() => {
                      const currentVariant = product.variants?.find(v => v.size === selectedSize);
                      if (currentVariant && quantity < currentVariant.stock) {
                        setQuantity(quantity + 1);
                      } else if (!selectedSize) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {selectedSize && selectedColor ? (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Chỉ còn {product.variants?.find(v => v.size === selectedSize && v.color === selectedColor)?.stock || 0} sản phẩm
                  </p>
                ) : (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {!selectedSize ? "Vui lòng chọn size" : "Vui lòng chọn màu"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={() => setIsTryOnModalOpen(true)}
              className="flex-1 bg-accent text-black py-5 rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-accent/20 flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5" /> Thử đồ AI ✨
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
            >
              <ShoppingBag className="w-5 h-5" /> Thêm vào giỏ
            </button>
            <button
              onClick={() => product && toggleWishlist(product)}
              className={cn(
                "w-16 h-16 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center transition-all group",
                isInWishlist(product!.id) ? "text-rose-500 border-rose-100 shadow-lg shadow-rose-100" : "text-slate-400 hover:text-rose-500 hover:border-rose-500"
              )}
            >
              <Heart className={cn("w-6 h-6 transition-all", isInWishlist(product!.id) ? "fill-current scale-110" : "group-hover:fill-current")} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Đã sao chép",
                  message: "Liên kết sản phẩm đã được lưu vào bộ nhớ tạm.",
                  variant: "success"
                });
              }}
              className="w-16 h-16 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 hover:text-black hover:border-black transition-all"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>

          {/* Delivery & Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-nude/30 rounded-xl flex items-center justify-center text-black flex-shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Giao hàng</h5>
                <p className="text-[10px] text-slate-500 font-medium">Miễn phí cho đơn hàng từ 1 triệu đồng.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-nude/30 rounded-xl flex items-center justify-center text-black flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Đổi trả</h5>
                <p className="text-[10px] text-slate-500 font-medium">Đổi trả miễn phí trong 30 ngày nếu không vừa ý.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <section className="mt-40 bg-slate-900 text-white p-10 md:p-16 rounded-[4rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[100px] rounded-full -mr-32 -mt-32" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">Chia sẻ trải nghiệm <br />của bạn</h2>
            <p className="text-white/40 font-bold text-sm leading-relaxed mb-8 max-w-md">Đánh giá của bạn không chỉ giúp chúng tôi hoàn thiện hơn mà còn là nguồn cảm hứng cho những khách hàng khác.</p>

            <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 w-fit">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Bạn chấm mấy sao?</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="transition-all hover:scale-125"
                  >
                    <Star
                      className={cn(
                        "w-6 h-6 transition-all",
                        star <= reviewRating ? "text-accent fill-accent" : "text-white/20 fill-transparent"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-6">
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-4">Lời bình luận của bạn</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Ví dụ: Chất vải rất mềm, form dáng chuẩn đẹp..."
                className="w-full bg-transparent border-none p-0 text-lg font-bold placeholder:text-white/10 min-h-[120px] resize-none outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="w-full bg-accent text-black py-6 rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-accent/20 disabled:opacity-50"
            >
              {isSubmittingReview ? "Đang gửi..." : "Gửi đánh giá ngay"}
            </button>
          </form>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-40">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Đánh giá từ khách hàng</h2>
          <div className="h-0.5 bg-nude flex-1 mx-10 hidden md:block opacity-30" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20 bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100">
          {/* Summary */}
          <div className="flex flex-col items-center justify-center text-center lg:border-r lg:border-slate-200 lg:pr-16">
            <h3 className="text-7xl font-black text-black mb-4">{product.averageRating || 0}</h3>
            <div className="flex items-center gap-1 mb-4 text-nude fill-nude">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={cn("w-5 h-5", i <= (product.averageRating || 0) ? "fill-current" : "text-slate-200 fill-transparent")} />
              ))}
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Dựa trên {product.reviewCount || 0} đánh giá</p>
          </div>

          {/* Progress Bars */}
          <div className="lg:col-span-2 space-y-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = product.ratingDistribution?.[star] || 0;
              const percentage = product.reviewCount && product.reviewCount > 0 ? (count / product.reviewCount) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-6">
                  <span className="text-[10px] font-black text-black w-12 text-right">{star} SAO</span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-nude"
                    />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 w-12">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white">
                      {review.user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-black uppercase text-sm">{review.user?.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-nude fill-nude">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={cn("w-3 h-3", i <= review.rating ? "fill-current" : "text-slate-200 fill-transparent")} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed italic">"{review.comment}"</p>
              </div>
            ))}

            {product.reviewCount && product.reviewCount > 5 && (
              <div className="md:col-span-2 flex justify-center mt-12">
                <button className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-accent hover:border-accent transition-colors">
                  Xem thêm {product.reviewCount - 5} đánh giá khác
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-black uppercase tracking-widest">Chưa có đánh giá nào cho sản phẩm này</p>
          </div>
        )}
      </section>

      {/* Related Products */}
      <section className="mt-40">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Sản phẩm liên quan</h2>
          <div className="h-0.5 bg-nude flex-1 mx-10 hidden md:block opacity-30" />
          <button className="text-xs font-black uppercase tracking-widest border-b-2 border-black pb-1">Xem tất cả</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {relatedProducts.filter(p => p.id !== product!.id).slice(0, 4).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      {product && (
        <TryOnModal
          isOpen={isTryOnModalOpen}
          onClose={() => setIsTryOnModalOpen(false)}
          productName={product.name}
          garmentImage={images[selectedImage]}
          category={(() => {
            const slug = product.category?.slug?.toLowerCase() || '';
            if (slug.includes('quan') || slug.includes('pant') || slug.includes('short') || slug.includes('chan-vay')) return 'lower_body';
            if (slug.includes('vay') || slug.includes('dress') || slug.includes('set')) return 'dresses';
            return 'upper_body';
          })()}
        />
      )}
    </div>
  );
}
