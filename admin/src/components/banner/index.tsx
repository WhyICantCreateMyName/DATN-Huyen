"use client";

import React, { useState } from "react";
import { useBanner, useBannerActions } from "@/hooks/use-banner";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Plus,
  Trash2,
  Edit2,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ChevronDown,
  ChevronUp,
  Layout,
  AlertTriangle,
  Save,
  X,
  Check,
  Type,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { BannerType } from "@/types";
import { ImagePicker } from "@/components/ui/input/ImagePicker";
import { uploadService } from "@/services/upload.service";
import { useToast } from "@/contexts/ToastContext";

export default function BannerModule() {
  const {
    data: sliders,
    isLoading,
    mutate: refresh
  } = useBanner();

  const {
    createBanner,
    isCreating,
    updateBanner,
    isUpdating,
    deleteBanner,
    isDeleting
  } = useBannerActions();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<{ id: string, name: string } | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newItems, setNewItems] = useState<BannerType.BannerItem[]>([]);

  const [localEdits, setLocalEdits] = useState<Record<string, BannerType.BannerSlider>>({});
  const [pendingFiles, setPendingFiles] = useState<Record<string, { file: File, preview: string }[]>>({});

  const { toast } = useToast();

  const handleToggleStatus = async (slider: BannerType.BannerSlider) => {
    await updateBanner({ id: slider.id, data: { isActive: !slider.isActive } });
  };

  const handleCreateSlider = async () => {
    if (!newName.trim()) {
      toast({ title: "Thiếu thông tin", message: "Vui lòng nhập tên cho Banner", variant: "error" });
      return;
    }
    if (newItems.length === 0) {
      toast({ title: "Thiếu hình ảnh", message: "Banner cần ít nhất một hình ảnh", variant: "error" });
      return;
    }

    const dataToSave = {
      name: newName,
      items: [...newItems],
      pending: [...(pendingFiles["new"] || [])]
    };

    setIsAdding(false);
    setExpandedId(null);
    setNewName("");
    setNewItems([]);
    setPendingFiles(prev => {
      const next = { ...prev };
      delete next["new"];
      return next;
    });

    toast({ title: "Đang xử lý", message: "Đang tạo Banner mới...", variant: "tip" });

    (async () => {
      try {
        let uploadedUrls: string[] = [];
        if (dataToSave.pending.length > 0) {
          const res = await uploadService.uploadMultiple(dataToSave.pending.map(p => p.file));
          uploadedUrls = res.data.data.files;
        }

        let uploadedIdx = 0;
        const finalItems = dataToSave.items.map(item => {
          if (item.image.startsWith('blob:')) {
            return { ...item, image: uploadedUrls[uploadedIdx++] };
          }
          return item;
        });

        await createBanner({
          name: dataToSave.name,
          items: finalItems,
          isActive: true
        });

        toast({ title: "Thành công", message: "Đã tạo Banner mới", variant: "success" });
      } catch (error) {
        console.error("Create error:", error);
        toast({ title: "Lỗi", message: "Không thể tạo Banner", variant: "error" });
      }
    })();
  };

  const handleSaveLocalEdit = async (sliderId: string) => {
    const draft = localEdits[sliderId];
    if (!draft) return;

    const dataToSave = {
      sliderId,
      draft: { ...draft },
      pending: [...(pendingFiles[sliderId] || [])]
    };

    setExpandedId(null);
    const newEdits = { ...localEdits };
    delete newEdits[sliderId];
    setLocalEdits(newEdits);
    setPendingFiles(prev => {
      const next = { ...prev };
      delete next[sliderId];
      return next;
    });

    toast({ title: "Đang xử lý", message: "Đang cập nhật Banner...", variant: "tip" });

    (async () => {
      try {
        let uploadedUrls: string[] = [];
        if (dataToSave.pending.length > 0) {
          const res = await uploadService.uploadMultiple(dataToSave.pending.map(p => p.file));
          uploadedUrls = res.data.data.files;
        }

        let uploadedIdx = 0;
        const finalItems = dataToSave.draft.items.map(item => {
          if (item.image.startsWith('blob:')) {
            return { ...item, image: uploadedUrls[uploadedIdx++] };
          }
          return item;
        });

        await updateBanner({ id: dataToSave.sliderId, data: { ...dataToSave.draft, items: finalItems } });
        toast({ title: "Thành công", message: "Đã cập nhật Banner", variant: "success" });
      } catch (error) {
        console.error("Save error:", error);
        toast({ title: "Lỗi", message: "Không thể lưu Banner", variant: "error" });
      }
    })();
  };

  const updateDraft = (sliderId: string, original: BannerType.BannerSlider, data: Partial<BannerType.BannerSlider>) => {
    setLocalEdits(prev => ({
      ...prev,
      [sliderId]: {
        ...(prev[sliderId] || original),
        ...data
      }
    }));
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteBanner(deleteConfirmId.id);
      setDeleteConfirmId(null);
    }
  };

  const handleUploadImages = async (files: FileList, isNew: boolean, slider: BannerType.BannerSlider) => {
    const fileArray = Array.from(files);
    const sliderId = isNew ? "new" : slider.id;

    const newPendingItems = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPendingFiles(prev => ({
      ...prev,
      [sliderId]: [...(prev[sliderId] || []), ...newPendingItems]
    }));

    const addedItems = newPendingItems.map(item => ({
      title: "Tiêu đề Banner",
      subtitle: "",
      description: "",
      image: item.preview,
      link: "/products",
      backgroundColor: "#ffffff",
      accentColor: "#6366f1"
    }));

    if (isNew) {
      setNewItems(prev => [...prev, ...addedItems].slice(0, 10));
    } else {
      const currentItems = localEdits[slider.id]?.items || slider.items || [];
      const updatedItems = [...currentItems, ...addedItems].slice(0, 10);
      updateDraft(slider.id, slider, { items: updatedItems });
    }
  };

  const handleRemoveImage = (index: number, isNew: boolean, slider: BannerType.BannerSlider) => {
    if (isNew) {
      setNewItems(prev => prev.filter((_, i) => i !== index));
    } else {
      const currentItems = localEdits[slider.id]?.items || slider.items || [];
      const updatedItems = currentItems.filter((_, i) => i !== index);
      updateDraft(slider.id, slider, { items: updatedItems });
    }
  };

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Quản lý Slider"
        subtitle="Quản lý các cụm banner quảng cáo trên trang thương mại."
        icon={Layout}
        onRefresh={refresh}
        refreshLoading={isLoading}
        addButtonText="Tạo Slider mới"
        onAdd={() => {
          setIsAdding(true);
          setExpandedId("new-slider");
        }}
      />

      <div className="grid grid-cols-1 gap-6">
        {isAdding && (
          <div className="bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-500/30 rounded-3xl overflow-hidden shadow-xl shadow-violet-500/10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <Layout className="w-8 h-8" />
              </div>

              <div className="flex-1 w-full text-center md:text-left">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nhập tên Slider..."
                  className="w-full bg-transparent border-none text-xl font-black text-zinc-900 dark:text-white placeholder:text-zinc-300 focus:ring-0 p-0"
                />
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                  {newItems.length} BANNER ITEMS • ID: NEW_SLIDER...
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCreateSlider}
                  disabled={isCreating}
                  className="p-3.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-2xl transition-all"
                  title="Lưu Slider"
                >
                  {isCreating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-7 h-7" />}
                </button>
                <button
                  onClick={() => setExpandedId(expandedId === "new-slider" ? null : "new-slider")}
                  className="p-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl hover:bg-zinc-200 transition-all"
                >
                  {expandedId === "new-slider" ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {expandedId === "new-slider" && (
              <div className="px-6 pb-8 border-t border-zinc-50 dark:border-zinc-800 pt-8 bg-zinc-50/30 dark:bg-zinc-950/20">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 block">Tải ảnh Banner lên</label>
                <ImagePicker
                  images={newItems.map(item => item.image)}
                  onUpload={(files) => handleUploadImages(files, true, {} as any)}
                  onRemove={(index) => handleRemoveImage(index, true, {} as any)}
                  isLoading={false}
                  maxFiles={10}
                  className="mb-8"
                  imageClassName="h-[350px] !aspect-auto"
                />

                {newItems.length > 0 && (
                  <BannerItemConfig
                    items={newItems}
                    onChange={setNewItems}
                    label="Cấu hình nội dung (Tùy chọn)"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {sliders?.map((slider) => {
          const draft = localEdits[slider.id];
          const hasChanges = !!draft;
          const currentSlider = draft || slider;

          return (
            <div
              key={slider.id}
              className={cn(
                "bg-white dark:bg-zinc-900 border rounded-3xl overflow-hidden transition-all duration-500",
                slider.isActive
                  ? "border-violet-100 dark:border-violet-500/20 shadow-[0_20px_50px_-20px_rgba(124,58,237,0.1)]"
                  : "border-zinc-100 dark:border-zinc-800 opacity-70 grayscale-[0.5]",
                hasChanges && "border-amber-200 dark:border-amber-500/30 ring-1 ring-amber-100"
              )}
            >
              <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
                  slider.isActive ? "bg-violet-100 text-violet-600" : "bg-zinc-100 text-zinc-400"
                )}>
                  <Layout className="w-8 h-8" />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                    <input
                      type="text"
                      value={currentSlider.name}
                      onChange={(e) => updateDraft(slider.id, slider, { name: e.target.value })}
                      className="bg-transparent border-none text-xl font-black text-zinc-900 dark:text-white focus:ring-0 p-0"
                    />
                    {slider.isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    {currentSlider.items?.length || 0} BANNER ITEMS • ID: {slider.id.slice(0, 8)}...
                    {hasChanges && <span className="ml-2 text-amber-500 font-bold">• ĐÃ THAY ĐỔI (CHƯA LƯU)</span>}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {hasChanges && (
                    <>
                      <button
                        onClick={() => handleSaveLocalEdit(slider.id)}
                        disabled={isUpdating}
                        className="p-3.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-2xl transition-all animate-bounce-subtle"
                        title="Lưu thay đổi"
                      >
                        {isUpdating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-7 h-7" />}
                      </button>
                      <button
                        onClick={() => {
                          const newEdits = { ...localEdits };
                          delete newEdits[slider.id];
                          setLocalEdits(newEdits);
                        }}
                        className="p-3.5 bg-zinc-100 text-zinc-400 hover:bg-zinc-200 rounded-2xl transition-all"
                        title="Hoàn tác"
                      >
                        <RotateCcw className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleToggleStatus(slider)}
                    disabled={isUpdating}
                    className={cn(
                      "p-3.5 rounded-2xl transition-all relative overflow-hidden group",
                      slider.isActive
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                    )}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      slider.isActive ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />
                    )}
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === slider.id ? null : slider.id)}
                    className="p-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl hover:bg-zinc-200 transition-all"
                  >
                    {expandedId === slider.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId({ id: slider.id, name: slider.name })}
                    disabled={isDeleting}
                    className="p-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {expandedId === slider.id && (
                <div className="px-6 pb-8 border-t border-zinc-50 dark:border-zinc-800 pt-8 bg-zinc-50/30 dark:bg-zinc-950/20">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 block">Quản lý ảnh Banner</label>
                  <ImagePicker
                    images={currentSlider.items?.map(item => item.image) || []}
                    onUpload={(files) => handleUploadImages(files, false, slider)}
                    onRemove={(index) => handleRemoveImage(index, false, slider)}
                    isLoading={isUpdating}
                    maxFiles={10}
                    className="mb-8"
                    imageClassName="h-[350px] !aspect-auto"
                  />

                  {currentSlider.items && currentSlider.items.length > 0 && (
                    <BannerItemConfig
                      items={currentSlider.items}
                      onChange={(newItems) => updateDraft(slider.id, slider, { items: newItems })}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}

        {sliders?.length === 0 && !isLoading && !isAdding && (
          <div className="py-32 text-center bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[3rem]">
            <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-950 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-12 h-12 text-zinc-200 dark:text-zinc-800" />
            </div>
            <p className="text-xl font-black text-zinc-400 uppercase tracking-widest">Chưa có Slider nào</p>
            <p className="text-zinc-400 text-sm font-medium mt-2">Bắt đầu bằng cách tạo một cụm slider mới.</p>
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <Modal
          onClose={() => setDeleteConfirmId(null)}
          title="Xác nhận xóa"
        >
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-zinc-900 mb-2">Bạn chắc chắn chứ?</h4>
            <p className="text-zinc-500 font-medium mb-8">
              Slider <span className="font-bold text-zinc-900">"{deleteConfirmId?.name}"</span> sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-4 bg-zinc-100 text-zinc-600 font-black rounded-2xl hover:bg-zinc-200 transition-colors"
              >
                HỦY BỎ
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "XÁC NHẬN XÓA"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

interface BannerItemConfigProps {
  items: BannerType.BannerItem[];
  onChange: (newItems: BannerType.BannerItem[]) => void;
  label?: string;
}

function BannerItemConfig({
  items,
  onChange,
  label = "Cấu hình nội dung",
}: BannerItemConfigProps) {
  const updateItem = (index: number, updates: Partial<BannerType.BannerItem>) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">
        {label}
      </label>

      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex items-start gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 group/edit"
        >
          <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 mt-0.5">
            <img
              src={item.image}
              alt="banner preview"
              className="w-full h-full object-stretch"
            />
          </div>

          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(idx, { title: e.target.value })}
              placeholder="Tiêu đề chính..."
              className="w-full bg-transparent border border-zinc-200 dark:border-zinc-700 focus:border-violet-400 rounded-xl px-4 py-3 text-sm font-bold focus:ring-0 h-11"
            />

            <input
              type="text"
              value={item.subtitle || ""}
              onChange={(e) => updateItem(idx, { subtitle: e.target.value })}
              placeholder="Tiêu đề phụ..."
              className="w-full bg-transparent border border-zinc-200 dark:border-zinc-700 focus:border-violet-400 rounded-xl px-4 py-3 text-xs text-zinc-400 focus:ring-0 h-11"
            />
          </div>

          <div className="flex flex-col items-center gap-3 pt-1">
            <input
              type="color"
              value={item.accentColor}
              onChange={(e) => updateItem(idx, { accentColor: e.target.value })}
              className="w-8 h-8 p-0 border-2 border-white dark:border-zinc-800 rounded-lg cursor-pointer shadow-sm"
            />
            <button className="p-2 text-zinc-300 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors opacity-0 group-hover/edit:opacity-100">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}