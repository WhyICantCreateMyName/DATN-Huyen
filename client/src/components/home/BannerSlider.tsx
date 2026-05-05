"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import Link from "next/link";
import { BannerType } from "@/types";

interface BannerSliderProps {
  items: BannerType.BannerItem[];
  autoPlayInterval?: number;
}

export default function BannerSlider({ items, autoPlayInterval = 6000 }: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.1
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 35 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.8 }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.9,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 35 },
        opacity: { duration: 0.4 }
      }
    })
  };

  const paginate = useCallback((newDirection: number) => {
    if (items.length <= 1) return;
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => paginate(1), autoPlayInterval);
    return () => clearInterval(timer);
  }, [items.length, paginate, autoPlayInterval]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <section className="relative w-full h-[70vh] overflow-hidden bg-black group/slider">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -10000) paginate(1);
            else if (swipe > 10000) paginate(-1);
          }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <motion.img
              src={currentItem.image}
              alt={currentItem.title}
              className="w-full h-full object-cover select-none"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6 }}
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 md:px-12">
              <div className="max-w-3xl space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4"
                    style={{ backgroundColor: currentItem.accentColor || '#fff', color: '#000' }}
                  >
                    {currentItem.subtitle || "New Collection"}
                  </span>
                  <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                    {currentItem.title.split(' ').map((word, i) => (
                       <span key={i} className="block">{word}</span>
                    ))}
                  </h2>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-white/80 text-lg md:text-xl font-medium max-w-xl"
                >
                  {currentItem.description || "Khám phá bộ sưu tập mới nhất với phong cách đẳng cấp và tinh tế từ Yuki Fashion."}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="pt-6"
                >
                  <Link
                    href={currentItem.link || "/products"}
                    className="inline-flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all group/btn"
                  >
                    MUA NGAY <MoveRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-12 flex items-center justify-between px-6 md:px-12 z-20 pointer-events-none">
        <div className="flex gap-3 pointer-events-auto">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
              className={cn(
                "h-1 transition-all duration-500 rounded-full",
                i === currentIndex ? "w-12 bg-white" : "w-6 bg-white/30 hover:bg-white/50"
              )}
            />
          ))}
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <button
            onClick={() => paginate(-1)}
            className="w-14 h-14 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all active:scale-90"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => paginate(1)}
            className="w-14 h-14 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all active:scale-90"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8 text-[10px] font-black text-white/20 uppercase tracking-[0.5em] [writing-mode:vertical-lr] select-none">
         YUKI FASHION • COLLECTION 2026
      </div>
    </section>
  );
}
