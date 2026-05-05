"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-zinc-100 dark:bg-zinc-900/50 -z-10 skew-x-12 translate-x-20" />
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-xs font-black uppercase tracking-[0.3em] rounded-full mb-6"
          >
            New Collection 2026
          </motion.span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            THỜI THƯỢNG <br />
            <span className="text-accent italic">CÙNG YUKI</span>
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-md font-medium leading-relaxed mb-10">
            Nâng tầm phong cách cá nhân với những thiết kế tinh tế và độc bản. Trải nghiệm sự kết hợp hoàn hảo giữa công nghệ AI và nghệ thuật thời trang.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/products"
              className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20"
            >
              MUA NGAY <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-full border border-zinc-200 dark:border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all duration-500">
                <Play className="w-5 h-5 fill-black dark:fill-white group-hover:fill-white" />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest">Xem Lookbook</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-white/5 flex gap-12">
            <div>
              <p className="text-3xl font-black">50K+</p>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Khách hàng</p>
            </div>
            <div>
              <p className="text-3xl font-black">200+</p>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Sản phẩm mới</p>
            </div>
          </div>
        </motion.div>

        {/* Right Media (Mockup) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="aspect-[4/5] bg-zinc-200 dark:bg-zinc-800 rounded-[3rem] overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-10">
              <p className="text-white font-black text-2xl uppercase italic">Spring Summer</p>
              <p className="text-white/60 font-medium text-sm">Collection By Yuki Team</p>
            </div>
            {/* Placeholder for Product Image */}
            <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold italic">
              IMAGE_PLACEHOLDER
            </div>
          </div>

          {/* Floating Element */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 w-48 h-48 bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-100 dark:border-white/5 hidden lg:block"
          >
            <div className="w-full h-full border-2 border-dashed border-accent/20 rounded-xl flex flex-col items-center justify-center text-center p-2">
              <p className="text-xs font-bold text-zinc-400 uppercase mb-1">Sale up to</p>
              <p className="text-4xl font-black text-accent">30%</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
