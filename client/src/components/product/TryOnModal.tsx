"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Upload, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Download
} from "lucide-react";
import { vtoService } from "@/services/vto.service";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  garmentImage: string;
  category?: string;
}

export default function TryOnModal({ isOpen, onClose, productName, garmentImage, category = "upper_body" }: TryOnModalProps) {
  const { toast } = useToast();
  const [humanImage, setHumanImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Lỗi", message: "Kích thước ảnh không được vượt quá 5MB", variant: "error" });
        return;
      }
      setHumanImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
    }
  };

  const handleTryOn = async () => {
    if (!humanImage) {
      toast({ title: "Thông báo", message: "Vui lòng tải lên ảnh của bạn trước", variant: "warning" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await vtoService.tryOn(humanImage, garmentImage, productName, category);
      setResultUrl(response.data.data.imageUrl);
      toast({ title: "Thành công", message: "AI đã hoàn tất việc ghép đồ!", variant: "success" });
    } catch (error: any) {
      console.error(error);
      toast({ title: "Lỗi AI", message: error.message || "Không thể thực hiện thử đồ lúc này", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[800px]"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all md:text-black md:bg-slate-100 md:hover:bg-slate-200"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left Side: Inputs */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto border-r border-slate-100 no-scrollbar">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Thử đồ thông minh</h2>
            </div>

            <div className="space-y-8">
              {/* Garment Preview */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Sản phẩm đang chọn</label>
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <img src={garmentImage} alt={productName} className="w-16 h-20 object-cover rounded-xl" />
                  <div>
                    <h3 className="font-black text-sm uppercase truncate max-w-[200px]">{productName}</h3>
                    <p className="text-[10px] text-slate-400 font-bold">YUKI FASHION FLAGSHIP</p>
                  </div>
                </div>
              </div>

              {/* User Image Upload */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block">Ảnh chân dung của bạn</label>
                <div 
                  onClick={() => !isLoading && fileInputRef.current?.click()}
                  className={cn(
                    "relative aspect-[4/5] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden",
                    previewUrl ? "border-transparent" : "border-slate-200 hover:border-accent hover:bg-accent/5",
                    isLoading && "opacity-50 cursor-wait"
                  )}
                >
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} className="w-full h-full object-cover" />
                      {!isLoading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Thay đổi ảnh
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mx-auto mb-4 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                        <Upload className="w-8 h-8" />
                      </div>
                      <p className="font-bold text-sm text-slate-600">Click để tải ảnh lên</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-2">Đứng thẳng, rõ mặt, trang phục đơn giản</p>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>

              <button
                onClick={handleTryOn}
                disabled={!humanImage || isLoading}
                className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Bắt đầu thử đồ
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Result */}
          <div className="flex-1 bg-slate-50 p-8 md:p-12 flex flex-col items-center justify-center relative min-h-[400px]">
            {isLoading ? (
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 text-accent animate-pulse" />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-tighter text-xl text-black">AI đang ghép đồ...</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Quá trình này mất khoảng 20 giây</p>
                </div>
                <div className="max-w-[200px] mx-auto pt-8">
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
            ) : resultUrl ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full flex flex-col"
              >
                <div className="relative flex-1 rounded-[2.5rem] overflow-hidden shadow-2xl bg-white group">
                  <img src={resultUrl} className="w-full h-full object-cover" />
                  <div className="absolute top-6 right-6">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-lg">
                      <CheckCircle2 className="w-4 h-4" /> Hoàn tất
                    </div>
                  </div>
                  
                  <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => window.open(resultUrl, '_blank')}
                      className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Tải ảnh về
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-6 shadow-sm">
                  <Sparkles className="w-12 h-12" />
                </div>
                <h4 className="font-black uppercase tracking-tighter text-slate-300 text-xl">Kết quả thử đồ</h4>
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-2 max-w-[200px] mx-auto leading-relaxed">
                  Hãy tải ảnh chân dung và nhấn bắt đầu để xem bản thân trong bộ đồ mới
                </p>
              </div>
            )}

            {/* AI Warning Badge */}
            <div className="absolute bottom-8 flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
              <AlertCircle className="w-3 h-3 text-slate-400" />
              <span className="text-[9px] font-bold text-slate-400 uppercase">Hình ảnh được tạo bởi AI mang tính chất tham khảo</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
