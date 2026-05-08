"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import { Sparkles, Cpu, Award, Users, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <main className="relative bg-white min-h-screen overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/about_hero_fashion_1778239769596.png" 
            alt="Yuki Fashion Hero" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-white" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-nude font-black text-xs uppercase tracking-[0.5em] mb-8 block drop-shadow-lg">
              Est. 2024 • The Future of Style
            </span>
            <h1 className="text-7xl md:text-[10rem] font-black text-white tracking-tighter leading-[0.8] mb-12 uppercase italic drop-shadow-2xl">
              YUKI <br /> <span className="text-nude">FASHION</span>
            </h1>
            <p className="text-white/80 text-xl md:text-2xl font-medium max-w-2xl mx-auto italic leading-relaxed">
              Nơi giao thoa giữa nghệ thuật may mặc đẳng cấp và trí tuệ nhân tạo tiên phong.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/40">
          <span className="text-[10px] font-black uppercase tracking-widest">Scroll to explore</span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-nude to-transparent" />
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-40 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-24 items-center">
        <div className="relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-nude/20 blur-[100px] rounded-full z-0" />
          <div className="relative z-10 rounded-[4rem] overflow-hidden aspect-square shadow-2xl">
             <img src="/about_hero_fashion_1778239769596.png" className="w-full h-full object-cover grayscale brightness-50" />
             <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                <p className="text-2xl font-black text-white italic leading-tight">
                  "Chúng tôi không chỉ bán quần áo, chúng tôi kiến tạo phong cách cá nhân hóa bằng công nghệ."
                </p>
             </div>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <span className="text-accent font-black text-xs uppercase tracking-[0.4em] mb-4 block">Our Vision</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              TẦM NHÌN <br /> KHÁC BIỆT
            </h2>
          </div>
          <div className="space-y-6 text-slate-500 font-medium text-lg leading-relaxed">
            <p>
              Tại Yuki Fashion, chúng tôi tin rằng mỗi cá nhân là một thực thể phong cách độc bản. Sứ mệnh của chúng tôi là xóa tan rào cản giữa thời trang cao cấp và người dùng thông qua sự hỗ trợ của AI.
            </p>
            <p>
              Không còn những lựa chọn sai lầm, không còn sự phân vân trước gương. AI Stylist của Yuki hiểu vóc dáng, sở thích và xu hướng để đưa ra những gợi ý hoàn hảo nhất dành riêng cho bạn.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-6">
            <div>
              <p className="text-4xl font-black text-slate-900 mb-2">10k+</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng tin dùng</p>
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900 mb-2">98%</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hài lòng với AI Stylist</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values - Glassmorphism Card Grid */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-nude/10 blur-[150px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">GIÁ TRỊ CỐT LÕI</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Award className="w-8 h-8" />, 
                title: "CHẤT LƯỢNG LUXURY", 
                desc: "Tuyển chọn khắt khe từ những nguồn vải cao cấp nhất thế giới, đảm bảo sự bền bỉ và sang trọng." 
              },
              { 
                icon: <Cpu className="w-8 h-8" />, 
                title: "AI STYLIST TIÊN PHONG", 
                desc: "Hệ thống trí tuệ nhân tạo độc quyền giúp phân tích và tối ưu hóa phong cách cá nhân trong tích tắc." 
              },
              { 
                icon: <Users className="w-8 h-8" />, 
                title: "TRẢI NGHIỆM ĐỘC BẢN", 
                desc: "Dịch vụ chăm sóc tận tâm, mang lại cảm giác mua sắm riêng tư và đẳng cấp như tại store vật lý." 
              }
            ].map((value, i) => (
              <div key={i} className="group p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all duration-500">
                <div className="w-16 h-16 bg-nude rounded-2xl flex items-center justify-center text-black mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase italic">{value.title}</h3>
                <p className="text-white/50 text-sm font-medium leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Stylist Spotlight */}
      <section className="py-40 max-w-7xl mx-auto px-6">
        <div className="bg-nude p-12 md:p-24 rounded-[4rem] flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 text-[12rem] font-black text-black/5 select-none leading-none pointer-events-none uppercase italic">
              YUKI AI
           </div>
           
           <div className="lg:w-1/2 relative z-10">
              <span className="text-black font-black text-xs uppercase tracking-[0.4em] mb-6 block">The Technology</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9] mb-10">
                AI STYLIST <br /> CỦA RIÊNG BẠN
              </h2>
              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-black" />
                  </div>
                  <p className="text-slate-800 font-bold">Thử đồ ảo 3D với độ chính xác cao.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-black" />
                  </div>
                  <p className="text-slate-800 font-bold">Gợi ý phối đồ dựa trên thời tiết và sự kiện.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-black" />
                  </div>
                  <p className="text-slate-800 font-bold">Bảo mật tuyệt đối thông tin vóc dáng người dùng.</p>
                </div>
              </div>
              <button className="bg-black text-white px-12 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20">
                Trải nghiệm ngay
              </button>
           </div>

           <div className="lg:w-1/2">
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white/30 backdrop-blur-md">
                 <img src="/about_hero_fashion_1778239769596.png" className="w-full h-full object-cover" />
              </div>
           </div>
        </div>
      </section>

      {/* Footer Branding */}
      <section className="py-40 bg-white text-center px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center transform rotate-12">
               <span className="text-white font-black text-3xl italic">Y</span>
            </div>
            <span className="text-4xl font-black tracking-tighter text-slate-900">
               YUKI<span className="text-accent italic">FASHION</span>
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 uppercase italic">
            CHÚNG TÔI ĐANG TÁI ĐỊNH NGHĨA <br /> CÁCH BẠN MẶC ĐẸP.
          </h2>
          <p className="text-slate-400 font-medium text-lg italic">Gia nhập cộng đồng Yuki Fashion ngay hôm nay.</p>
          <div className="flex flex-wrap justify-center gap-12 pt-10 border-t border-slate-100">
             {['Instagram', 'Facebook', 'TikTok', 'YouTube'].map(s => (
               <a key={s} href="#" className="text-xs font-black uppercase tracking-widest text-slate-300 hover:text-accent transition-colors">{s}</a>
             ))}
          </div>
          <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] pt-20">© 2026 YUKI FASHION GROUP. ARTIFICIALLY INTELLIGENT, NATURALLY STYLISH.</p>
        </div>
      </section>
    </main>
  );
}
