"use client";

import React, { useState, useCallback, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePickerProps {
  images: string[];
  onUpload: (files: FileList) => Promise<void>;
  onRemove: (index: number) => void;
  isLoading?: boolean;
  maxFiles?: number;
  className?: string;
  description?: string;
  imageClassName?: string;
}

export function ImagePicker({
  images,
  onUpload,
  onRemove,
  isLoading = false,
  maxFiles = 10,
  className,
  description = "Hỗ trợ JPG, PNG, WEBP. Tối đa 10 ảnh.",
  imageClassName,
}: ImagePickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onUpload(files);
      }
    },
    [onUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-2 gap-4">
        {images.map((url, index) => (
          <div
            key={index}
            className={cn("group relative aspect-[4/5] rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm animate-in zoom-in duration-300", imageClassName)}
          >
            <img
              src={url}
              alt={`Upload ${index}`}
              className={"w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"}
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-3 bg-white text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-xl active:scale-90"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Badge Ảnh bìa - Thiết kế lại để không bị đè */}
            {index === 0 && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-violet-600/90 backdrop-blur-md text-white text-[9px] font-black py-2 rounded-xl text-center uppercase tracking-[0.15em] shadow-lg border border-white/10">
                  Ảnh chủ đạo
                </div>
              </div>
            )}
          </div>
        ))}

        {images.length < maxFiles && (
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative aspect-[4/5] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group",
              isDragging
                ? "border-violet-500 bg-violet-500/5 scale-95"
                : "border-zinc-200 dark:border-zinc-800 hover:border-violet-500/50 hover:bg-violet-500/5",
              isLoading && "pointer-events-none opacity-50",
              imageClassName
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Đang tải...</span>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:scale-110 group-hover:border-violet-500/50 transition-all duration-300">
                  <Upload
                    className={cn(
                      "w-6 h-6 text-zinc-400 group-hover:text-violet-500 transition-colors",
                      isDragging && "text-violet-500"
                    )}
                  />
                </div>
                <div className="text-center px-4">
                  <span className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.1em] group-hover:text-violet-500 transition-colors">
                    {isDragging ? "Thả tại đây" : "Thêm ảnh mới"}
                  </span>
                </div>
              </>
            )}
          </label>
        )}
      </div>

      <div className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
        <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-800">
          <ImageIcon className="w-4 h-4 text-zinc-400" />
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
          {description} Ảnh đầu tiên nằm ở vị trí số 1 sẽ mặc định là ảnh đại diện.
        </p>
      </div>
    </div>
  );
}
