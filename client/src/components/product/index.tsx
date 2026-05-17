"use client";

import React, { useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { Search, Filter, X } from "lucide-react";
import useSWR from "swr";
import { cn } from "@/lib/utils";

import { useProduct } from "@/hooks/use-product";
import { useCategory } from "@/hooks/use-category";
import { Pagination } from "@/components/ui/Pagination";

export default function ProductsComponent() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Use Custom Hooks mapped from Admin
  const { categories } = useCategory();
  const { products, pagination, isLoading } = useProduct({
    search,
    categoryId: selectedCategory || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sort,
    page,
    limit: 12
  });

  // Handle filter changes
  const handleCategoryChange = (catId: string | null) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <>
      {/* Hero Header */}
      <div className="bg-zinc-50 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <span className="text-indigo-600 font-black text-xs uppercase tracking-[0.4em] mb-4 block">Collections</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 leading-tight uppercase">
            TẤT CẢ <br /> SẢN PHẨM
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-10">
            {/* Search */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tìm kiếm</h4>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Bạn tìm gì..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600/20 transition-all"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danh mục</h4>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={cn(
                    "text-left py-2 px-4 rounded-xl text-sm font-bold transition-all",
                    selectedCategory === null ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  Tất cả
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={cn(
                      "text-left py-2 px-4 rounded-xl text-sm font-bold transition-all",
                      selectedCategory === cat.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Price Range */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Khoảng giá (VNĐ)</h4>
              
              {/* Quick Price Filters */}
              <div className="flex flex-col gap-2 mb-6">
                {[
                  { label: 'Tất cả giá', min: '', max: '' },
                  { label: 'Dưới 200.000đ', min: '0', max: '200000' },
                  { label: '200.000đ - 500.000đ', min: '200000', max: '500000' },
                  { label: '500.000đ - 1.000.000đ', min: '500000', max: '1000000' },
                  { label: 'Trên 1.000.000đ', min: '1000000', max: '' },
                ].map((range, idx) => {
                  const isActive = minPrice === range.min && maxPrice === range.max;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setMinPrice(range.min);
                        setMaxPrice(range.max);
                        setPage(1);
                      }}
                      className={cn(
                        "text-left py-2 px-4 rounded-xl text-[11px] font-bold transition-all",
                        isActive ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200" : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Từ..."
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-600/20 transition-all"
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Đến..."
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-bold focus:ring-2 focus:ring-indigo-600/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <p className="text-sm font-bold text-slate-400">
                  Hiển thị <span className="text-slate-900">{products.length}</span> sản phẩm
                </p>
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  <Filter className="w-4 h-4" /> Lọc
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden md:inline text-xs font-black text-slate-400 uppercase tracking-widest">Sắp xếp:</span>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="bg-transparent border-none text-sm font-black uppercase tracking-widest focus:ring-0 cursor-pointer"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp - Cao</option>
                  <option value="price-desc">Giá: Cao - Thấp</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[3/4] bg-slate-50 animate-pulse rounded-[2.5rem]" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {pagination && (
                  <div className="sticky bottom-8 left-0 right-0 z-30 flex justify-center mt-12">
                    <div className="bg-[#EBD9C3]/80 backdrop-blur-xl border border-[#D7C4B0]/50 px-6 rounded-full shadow-2xl shadow-[#EBD9C3]/20">
                      <Pagination
                        page={page}
                        totalPages={pagination.totalPages}
                        onPageChange={(p) => {
                          setPage(p);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                <Search className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-xl font-black text-slate-900 uppercase">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-500 font-medium mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
                <button
                  onClick={() => { 
                    setSearch(""); 
                    setSelectedCategory(null); 
                    setMinPrice("");
                    setMaxPrice("");
                    setPage(1); 
                  }}
                  className="mt-8 text-xs font-black uppercase tracking-widest border-b-2 border-slate-900 pb-1"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] bg-white lg:hidden animate-in slide-in-from-right duration-300">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Bộ lọc</h2>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-50 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 space-y-12 overflow-y-auto">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tìm kiếm</h4>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Bạn tìm gì..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-12 pr-4 text-sm font-medium focus:ring-0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Danh mục</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className={cn(
                      "py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                      selectedCategory === null ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"
                    )}
                  >
                    Tất cả
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-center",
                        selectedCategory === cat.id ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Khoảng giá (VNĐ)</h4>
                
                {/* Quick Price Filters */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Tất cả giá', min: '', max: '' },
                    { label: 'Dưới 200k', min: '0', max: '200000' },
                    { label: '200k - 500k', min: '200000', max: '500000' },
                    { label: '500k - 1tr', min: '500000', max: '1000000' },
                    { label: 'Trên 1tr', min: '1000000', max: '' },
                  ].map((range, idx) => {
                    const isActive = minPrice === range.min && maxPrice === range.max;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setMinPrice(range.min);
                          setMaxPrice(range.max);
                          setPage(1);
                        }}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center",
                          isActive ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"
                        )}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Từ..."
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-sm font-bold focus:ring-0"
                  />
                  <input
                    type="number"
                    placeholder="Đến..."
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 text-sm font-bold focus:ring-0"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest"
              >
                Xem kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
