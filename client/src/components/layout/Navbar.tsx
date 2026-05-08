"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Search, User, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useProduct } from "@/hooks/use-product";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  // Search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { products: searchResults, isLoading: isSearching } = useProduct({
    search: searchQuery,
    limit: 5
  });

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    { label: "Trang chủ", href: "/" },
    { label: "Sản phẩm", href: "/products" },
    { label: "Bộ sưu tập", href: "/collections" },
    { label: "Về chúng tôi", href: "/about" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-100 py-3 shadow-sm"
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
            <span className="text-white font-black text-xl italic">Y</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">
            YUKI<span className="text-accent italic">FASHION</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors tracking-widest uppercase"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 rounded-full hover:bg-slate-50 transition-colors"
            >
              <Search className="w-5 h-5 text-slate-900" />
            </button>

            {/* Search Dropdown Overlay */}
            <AnimatePresence>
              {isSearchOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-full right-0 mt-3 w-[350px] md:w-[450px] bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-black/10 p-6 z-50"
                  >
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-black/5 transition-all"
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Kết quả tìm kiếm</h4>
                      
                      <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-2">
                        {isSearching ? (
                          <div className="py-10 text-center">
                            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
                          </div>
                        ) : searchQuery && searchResults.length > 0 ? (
                          searchResults.map((product) => (
                            <Link
                              key={product.id}
                              href={`/product/${product.slug || product.id}`}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-2xl transition-all group"
                            >
                              <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-black text-slate-900 truncate uppercase tracking-tighter">
                                  {product.name}
                                </h5>
                                <p className="text-[10px] font-bold text-accent">
                                  {Math.min(...product.variants.map(v => Number(v.price))).toLocaleString('vi-VN')} ₫
                                </p>
                              </div>
                            </Link>
                          ))
                        ) : searchQuery ? (
                          <div className="py-10 text-center">
                            <p className="text-xs font-bold text-slate-400">Không tìm thấy sản phẩm nào</p>
                          </div>
                        ) : (
                          <div className="py-10 text-center">
                            <p className="text-xs font-bold text-slate-400 italic">Nhập tên sản phẩm để tìm kiếm...</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {searchQuery && searchResults.length >= 5 && (
                      <Link
                        href={`/products?search=${searchQuery}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="block w-full mt-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors border-t border-slate-50"
                      >
                        Xem tất cả kết quả
                      </Link>
                    )}
                  </motion.div>
                  {/* Backdrop for closing */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSearchOpen(false)}
                  />
                </>
              )}
            </AnimatePresence>
          </div>

          <Link href="/cart" className="p-2.5 rounded-full hover:bg-slate-50 transition-colors relative">
            <ShoppingBag className="w-5 h-5 text-slate-900" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                {totalItems}
              </span>
            )}
          </Link>

          <div className="relative">
            {!mounted ? (
              <div className="w-10 h-10" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors border border-slate-100"
                >
                  <div className="w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-black text-slate-900 hidden lg:block uppercase tracking-tighter">{user.name}</span>
                  <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isUserMenuOpen && "rotate-180")} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-3 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50">
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors">
                      <User className="w-4 h-4" /> Tài khoản
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 rounded-xl text-xs font-bold text-rose-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="p-2.5 rounded-full hover:bg-slate-50 transition-colors flex items-center gap-2">
                <User className="w-5 h-5 text-slate-900" />
                <span className="text-xs font-black text-slate-900 hidden lg:block uppercase tracking-tighter">Đăng nhập</span>
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2.5 rounded-full hover:bg-slate-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-black text-slate-900 tracking-tighter"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-6 border-t border-slate-50 flex flex-col gap-4">
                {mounted && (
                  user ? (
                    <>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Xin chào, {user.name}</p>
                      <button onClick={logout} className="w-full py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl">Đăng xuất</button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 bg-slate-900 text-white font-bold text-center rounded-2xl">Đăng nhập</Link>
                  )
                )}
                <button className="w-full py-4 border border-slate-100 font-bold rounded-2xl">Hỗ trợ</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
