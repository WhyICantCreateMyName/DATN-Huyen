import React, { useState, useEffect } from "react";
import { X, Upload, CheckCircle2, Package, Trash2, Search } from "lucide-react";
import { useCollectionActions } from "@/hooks/use-collection";
import { useProduct } from "@/hooks/use-product";
import { uploadService } from "@/services/upload.service";
import { useToast } from "@/contexts/ToastContext";
import { cn } from "@/lib/utils";
import { SearchableSelect } from "@/components/ui/select/SearchableSelect";

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  collection: any;
  onSuccess: () => void;
}

export default function CollectionModal({ isOpen, onClose, collection, onSuccess }: CollectionModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Product Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");

  const { data: products, isLoading: isLoadingProducts } = useProduct({
    search: productSearch,
    limit: 50
  });

  const { createCollection, isCreating, updateCollection, isUpdating } = useCollectionActions();
  const isSubmitting = isCreating || isUpdating;

  const { toast } = useToast();

  useEffect(() => {
    if (collection) {
      setName(collection.name || "");
      setDescription(collection.description || "");
      setImage(collection.image || "");
      setPreviewUrl(collection.image || "");
      setIsActive(collection.isActive ?? true);
      // Populate selected products from collection
      setSelectedProductIds(collection.products?.map((p: any) => p.id) || []);
    } else {
      setName("");
      setDescription("");
      setImage("");
      setPreviewUrl("");
      setIsActive(true);
      setSelectedProductIds([]);
    }
    setSelectedFile(null);
  }, [collection, isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave = {
      name,
      description,
      image,
      isActive,
      selectedFile,
      productIds: selectedProductIds
    };

    // Close modal immediately
    onClose();

    // Run the rest in background
    (async () => {
      let finalImageUrl = dataToSave.image;

      try {
        if (dataToSave.selectedFile) {
          toast({ title: "Đang xử lý", message: "Đang tải ảnh và lưu bộ sưu tập...", variant: "tip" });
          finalImageUrl = await uploadService.uploadSingle(dataToSave.selectedFile);
        }

        const data = {
          name: dataToSave.name,
          description: dataToSave.description,
          image: finalImageUrl,
          isActive: dataToSave.isActive,
          productIds: dataToSave.productIds
        };

        if (collection) {
          await updateCollection({ id: collection.id, data });
        } else {
          await createCollection(data);
        }

        onSuccess();
        toast({ title: "Thành công", message: "Đã lưu bộ sưu tập", variant: "success" });
      } catch (error: any) {
        console.error(error);
        toast({ title: "Lỗi", message: "Không thể lưu bộ sưu tập", variant: "error" });
      }
    })();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-900">
              {collection ? "Cập nhật bộ sưu tập" : "Tạo bộ sưu tập mới"}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Thông tin & Sản phẩm liên quan</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tên bộ sưu tập</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: BST Mùa Hè 2024"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Mô tả (tùy chọn)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Chia sẻ về ý tưởng của bộ sưu tập này..."
                    rows={4}
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-slate-900/5 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Ảnh đại diện</label>
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="w-32 h-32 rounded-2xl bg-white border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative group shrink-0">
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <Upload className="w-6 h-6 text-slate-300" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight mb-1">Tải ảnh lên</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">
                        JPG, PNG, WEBP. Tối đa 5MB.<br />
                        Slug sẽ được tạo tự động theo tên.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Hiển thị công khai</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bộ sưu tập sẽ xuất hiện trên cửa hàng</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={cn(
                      "w-14 h-8 rounded-full relative transition-all duration-300",
                      isActive ? "bg-slate-900 shadow-lg shadow-slate-900/20" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-sm",
                      isActive ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
              </div>

              {/* Right Column: Product Management */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Thêm sản phẩm vào BST</label>
                  <SearchableSelect
                    options={products.map(p => ({ label: p.name, value: p.id }))}
                    value=""
                    onChange={(val) => {
                      if (val && !selectedProductIds.includes(val as string)) {
                        setSelectedProductIds(prev => [...prev, val as string]);
                      }
                    }}
                    onSearch={setProductSearch}
                    isLoading={isLoadingProducts}
                    placeholder="Tìm theo tên sản phẩm..."
                    className="!rounded-2xl"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Đã chọn {selectedProductIds.length} sản phẩm
                    </span>
                    {selectedProductIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedProductIds([])}
                        className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                      >
                        Gỡ tất cả
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-[2.5rem] p-4 border border-slate-100 min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
                    {selectedProductIds.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                        <Package className="w-12 h-12 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Chưa có sản phẩm nào</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {selectedProductIds.map(id => {
                          const product = products.find(p => p.id === id) || collection?.products?.find((p: any) => p.id === id);
                          return (
                            <div key={id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-100 group animate-in fade-in slide-in-from-right-1">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                                  {product?.images ? (
                                    <img
                                      src={typeof product.images === 'string' ? JSON.parse(product.images)[0] : product.images[0]}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package className="w-4 h-4 text-slate-300" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-slate-900 truncate pr-4">{product?.name || "Sản phẩm không tên"}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: {id.slice(0, 8)}...</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedProductIds(prev => prev.filter(i => i !== id))}
                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-50">
              <button
                type="button"
                onClick={onClose}
                className="order-2 sm:order-1 flex-1 py-5 rounded-[2rem] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="order-1 sm:order-2 flex-[2] bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{collection ? "Lưu thay đổi" : "Tạo bộ sưu tập"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
