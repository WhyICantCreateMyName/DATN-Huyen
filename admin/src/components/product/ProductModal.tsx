"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Image as ImageIcon,
  LayoutGrid,
  Info
} from "lucide-react";
import { uploadService } from "@/services/upload.service";
import { useToast } from "@/contexts/ToastContext";
import { useVariantForm } from "@/hooks/use-variant";
import { useCategory } from "@/hooks/use-category";
import { useCollection } from "@/hooks/use-collection";
import { useProductActions } from "@/hooks/use-product";
import { Product } from "@/types/product";
import { SearchableSelect } from "@/components/ui/select/SearchableSelect";
import { ImagePicker } from "@/components/ui/input/ImagePicker";
import { Modal } from "@/components/ui/Modal";

interface ProductFormModuleProps {
  initialData?: Product;
  isEdit?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProductFormModule({ initialData, isEdit = false, onClose, onSuccess }: ProductFormModuleProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const { data: categories, isLoading: isLoadingCategories } = useCategory({
    search: categorySearch,
    limit: 20
  });

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<{ file: File, preview: string }[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [collectionSearch, setCollectionSearch] = useState("");

  const { data: allCollections, isLoading: isLoadingCollections } = useCollection({
    search: collectionSearch,
    limit: 50
  });

  const {
    variants,
    addVariant,
    removeVariant,
    updateVariant,
    setVariants,
    validateVariants
  } = useVariantForm([]);

  React.useEffect(() => {
    setName(initialData?.name || "");
    setCategoryId(initialData?.categoryId || "");
    setDescription(initialData?.description || "");

    let imagesData: string[] = [];
    if (initialData?.images) {
      imagesData = typeof initialData.images === 'string'
        ? JSON.parse(initialData.images)
        : initialData.images;
    }
    setExistingImages(imagesData);
    setNewImages([]); // Reset new files

    if (initialData?.variants) {
      setVariants(initialData.variants.map(v => ({
        id: v.id,
        size: v.size,
        color: v.color,
        price: v.price.toString(),
        stock: v.stock.toString()
      })));
    } else {
      setVariants([{ size: "", color: "", price: "", stock: "" }]);
    }

    if (initialData?.collections) {
      setSelectedCollectionIds(initialData.collections.map(c => c.id));
    } else {
      setSelectedCollectionIds([]);
    }
  }, [initialData, setVariants]);

  const handleImageSelect = async (files: FileList) => {
    const fileArray = Array.from(files);
    const newItems = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setNewImages(prev => [...prev, ...newItems]);
  };

  const removeImage = (index: number) => {
    if (index < existingImages.length) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const newIdx = index - existingImages.length;
      setNewImages(prev => {
        const item = prev[newIdx];
        if (item) URL.revokeObjectURL(item.preview);
        return prev.filter((_, i) => i !== newIdx);
      });
    }
  };

  const { createProduct, updateProduct, isCreating, isUpdating, mutate } = useProductActions();
  const loading = isCreating || isUpdating;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const allCurrentImages = [...existingImages, ...newImages.map(n => n.preview)];

    if (!name || !categoryId || allCurrentImages.length === 0) {
      toast({ title: "Lưu ý", message: "Vui lòng điền đủ thông tin và có ít nhất 1 ảnh", variant: "warning" });
      return;
    }

    if (!validateVariants()) {
      toast({ title: "Lưu ý", message: "Vui lòng điền đầy đủ thông tin cho tất cả các biến thể", variant: "warning" });
      return;
    }

    // Capture data for background task
    const dataToSave = {
      name,
      categoryId,
      description,
      existingImages,
      newImages,
      selectedCollectionIds,
      variants: [...variants]
    };

    // Close modal immediately
    onClose();
    toast({ title: "Đang xử lý", message: "Đang chuẩn bị dữ liệu và tải ảnh...", variant: "tip" });

    // Background process
    (async () => {
      try {
        // 1. Upload new files if any
        let uploadedUrls: string[] = [];
        if (dataToSave.newImages.length > 0) {
          const res = await uploadService.uploadMultiple(dataToSave.newImages.map(n => n.file));
          uploadedUrls = res.data.data.files;
        }

        // 2. Combine existing with newly uploaded
        const finalImages = [...dataToSave.existingImages, ...uploadedUrls];

        const productData = {
          name: dataToSave.name.trim(),
          categoryId: dataToSave.categoryId,
          description: dataToSave.description,
          images: finalImages,
          collectionIds: dataToSave.selectedCollectionIds,
          variants: dataToSave.variants.map(v => ({
            id: v.id,
            size: v.size.trim(),
            color: v.color.trim(),
            price: parseFloat(v.price),
            stock: parseInt(v.stock)
          }))
        };

        if (isEdit && initialData?.id) {
          await updateProduct({ id: initialData.id, data: productData });
        } else {
          await createProduct(productData);
        }

        mutate((key: any) => Array.isArray(key) && (key[0] === 'products' || key[0] === 'variants'));
        if (onSuccess) onSuccess();
        toast({ title: "Thành công", message: "Đã lưu sản phẩm", variant: "success" });
      } catch (err: any) {
        console.error(err);
        toast({ title: "Lỗi", message: "Không thể lưu sản phẩm. Vui lòng kiểm tra lại.", variant: "error" });
      }
    })();
  };

  const headerActions = (
    <button
      type="button"
      onClick={() => handleSubmit()}
      disabled={loading}
      className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-violet-500/20"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      <span>{isEdit ? "Lưu thay đổi" : "Xuất bản ngay"}</span>
    </button>
  );

  return (
    <Modal
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
      size="xl"
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-500/10 rounded-2xl flex items-center justify-center">
                <Info className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Thông tin tổng quan</h2>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400 ml-1">Tên sản phẩm</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-[15px] font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400 ml-1">Danh mục sản phẩm</label>
                <SearchableSelect
                  options={categories.map(cat => ({ label: cat.name, value: cat.id }))}
                  value={categoryId}
                  onChange={(val) => setCategoryId(val as string)}
                  onSearch={setCategorySearch}
                  isLoading={isLoadingCategories}
                  placeholder="Tìm kiếm và chọn danh mục..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400 ml-1">Bộ sưu tập</label>
                <div className="space-y-3">
                  <SearchableSelect
                    options={allCollections.map(col => ({ label: col.name, value: col.id }))}
                    value=""
                    onChange={(val) => {
                      if (val && !selectedCollectionIds.includes(val as string)) {
                        setSelectedCollectionIds([...selectedCollectionIds, val as string]);
                      }
                    }}
                    onSearch={setCollectionSearch}
                    isLoading={isLoadingCollections}
                    placeholder="Thêm vào bộ sưu tập..."
                  />

                  {selectedCollectionIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedCollectionIds.map(id => {
                        const col = allCollections.find(c => c.id === id) || initialData?.collections?.find(c => c.id === id);
                        return (
                          <div key={id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl text-xs font-bold border border-violet-100 dark:border-violet-500/20">
                            <span>{col?.name || "Đang tải..."}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedCollectionIds(selectedCollectionIds.filter(i => i !== id))}
                              className="hover:text-violet-900 dark:hover:text-violet-200 transition-colors"
                            >
                              <Plus className="w-3 h-3 rotate-45" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-600 dark:text-zinc-400 ml-1">Mô tả sản phẩm</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Viết nội dung mô tả sản phẩm tại đây..."
                  className="w-full px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-[15px] font-medium resize-none"
                />
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Phân loại & Giá bán</h2>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-violet-600 hover:text-white rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-400 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm loại</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-4 text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                <div className="col-span-3">Kích cỡ</div>
                <div className="col-span-3">Màu sắc</div>
                <div className="col-span-3">Giá niêm yết</div>
                <div className="col-span-2">Tồn kho</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center group/item animate-in fade-in slide-in-from-right-2">
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariant(index, "size", e.target.value)}
                        placeholder="Size..."
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-violet-500 outline-none text-sm font-bold transition-all"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => updateVariant(index, "color", e.target.value)}
                        placeholder="Màu..."
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-violet-500 outline-none text-sm font-bold transition-all"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, "price", e.target.value)}
                        placeholder="Giá..."
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-violet-500 outline-none text-sm font-bold transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, "stock", e.target.value)}
                        placeholder="Số lượng..."
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-violet-500 outline-none text-sm font-bold transition-all"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 space-y-6 sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Thư viện ảnh</h2>
            </div>

            <ImagePicker
              images={[...existingImages, ...newImages.map(n => n.preview)]}
              onUpload={(files) => handleImageSelect(files as any)}
              onRemove={removeImage}
              isLoading={uploading}
            />
          </section>
        </div>
      </div>
    </Modal>
  );
}
