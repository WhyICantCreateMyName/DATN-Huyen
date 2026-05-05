"use client";

import React, { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Save,
    Loader2,
    Search,
    ShoppingCart,
    User,
    FileText,
    DollarSign,
    Package
} from "lucide-react";
import { usePurchaseActions } from "@/hooks/use-purchase";
import { useVariant } from "@/hooks/use-variant";
import { useToast } from "@/contexts/ToastContext";
import { Modal } from "@/components/ui/Modal";
import { SearchableSelect } from "@/components/ui/select/SearchableSelect";
import { QuickProductModal } from "@/components/product/QuickProductModal";
import { cn } from "@/lib/utils";
import { scanInvoice } from "@/lib/ocr";

interface PurchaseModalProps {
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: any;
}

interface PurchaseItem {
    variantId?: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    costPrice: number;
    isPending?: boolean;
}

export default function PurchaseModal({ onClose, onSuccess, initialData }: PurchaseModalProps) {
    const { toast } = useToast();
    const { createInvoice, isCreating, updateInvoice, isUpdating } = usePurchaseActions();

    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [supplierName, setSupplierName] = useState("");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<PurchaseItem[]>([]);

    useEffect(() => {
        if (initialData) {
            setInvoiceNumber(initialData.invoiceNumber || "");
            setSupplierName(initialData.supplierName || "");
            setNotes(initialData.notes || "");
            if (initialData.items) {
                setItems(initialData.items.map((item: any) => ({
                    variantId: item.variantId,
                    name: item.variant?.product?.name || "Sản phẩm",
                    size: item.variant?.size || "",
                    color: item.variant?.color || "",
                    quantity: item.quantity,
                    costPrice: item.costPrice
                })));
            }
        }
    }, [initialData]);

    const [variantSearch, setVariantSearch] = useState("");
    const { data: variants, isLoading: isLoadingVariants, mutate: mutateVariants } = useVariant({
        search: variantSearch,
        limit: 100
    });

    const [isScanning, setIsScanning] = useState(false);
    const [isQuickProductModalOpen, setIsQuickProductModalOpen] = useState(false);
    const [quickProductName, setQuickProductName] = useState("");
    const [quickProductSize, setQuickProductSize] = useState("");
    const [quickProductColor, setQuickProductColor] = useState("");

    const variantOptions = (variants || []).map(v => ({
        label: `${v.product?.name || 'Sản phẩm'} - ${v.size} / ${v.color}`,
        value: v.id,
        variant: v
    }));

    const handleAddVariant = (variantId: string | number) => {
        if (!variantId) return;

        const option = variantOptions.find(o => o.value === variantId);
        if (!option) return;

        const v = option.variant;

        if (items.find(item => item.variantId === v.id)) {
            toast({
                title: "Lưu ý",
                message: "Sản phẩm này đã có trong danh sách",
                variant: "warning"
            });
            return;
        }

        setItems([...items, {
            variantId: v.id,
            name: v.product?.name || "Sản phẩm",
            size: v.size,
            color: v.color,
            quantity: 1,
            costPrice: Number(v.price)
        }]);
    };

    const handleUpdateItem = (index: number, field: keyof PurchaseItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleScanInvoice = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        toast({ title: "Đang xử lý", message: "Đang nhận diện văn bản từ hóa đơn...", variant: "success" });

        try {
            const result = await scanInvoice(file);

            if (result.invoiceNumber) setInvoiceNumber(result.invoiceNumber);
            if (result.supplierName) setSupplierName(result.supplierName);

            const reconciledItems = result.items.map(scanned => {
                const variant = (variants || []).find(v => {
                    const vName = v.product?.name?.toLowerCase() || "";
                    const sName = scanned.name.toLowerCase();
                    return (vName.includes(sName) || sName.includes(vName)) &&
                        v.size.toLowerCase() === scanned.size.toLowerCase() &&
                        v.color.toLowerCase() === scanned.color.toLowerCase();
                });

                if (variant) {
                    return {
                        variantId: variant.id,
                        name: variant.product?.name || scanned.name,
                        size: variant.size,
                        color: variant.color,
                        quantity: scanned.quantity,
                        costPrice: scanned.costPrice,
                        isPending: false
                    };
                }
                return scanned;
            });

            if (reconciledItems.length > 0) {
                setItems(prev => {
                    const uniqueNewItems = reconciledItems.filter(ri => {
                        const riWithId = ri as any;
                        return !prev.some(p =>
                            (riWithId.variantId && p.variantId === riWithId.variantId) ||
                            (!riWithId.variantId && p.name === riWithId.name && p.size === riWithId.size && p.color === riWithId.color)
                        );
                    });
                    return [...prev, ...uniqueNewItems];
                });
            }

            toast({
                title: "Hoàn tất",
                message: `Đã bóc tách thành công ${reconciledItems.length} sản phẩm`,
                variant: "success"
            });
        } catch (err) {
            console.error("OCR Error:", err);
            toast({ title: "Lỗi", message: "Không thể nhận diện hóa đơn. Vui lòng thử lại hoặc nhập tay.", variant: "error" });
        } finally {
            setIsScanning(false);
        }
    };

    const handleQuickCreateSuccess = (newVariant: any) => {
        if (!newVariant) {
            mutateVariants();
            return;
        }

        const pendingIndex = (window as any).pendingItemIndex;
        if (pendingIndex !== undefined && pendingIndex >= 0) {
            const newItems = [...items];
            newItems[pendingIndex] = {
                variantId: newVariant.id,
                name: newVariant.product?.name || quickProductName || "Sản phẩm mới",
                size: newVariant.size,
                color: newVariant.color,
                quantity: items[pendingIndex].quantity,
                costPrice: items[pendingIndex].costPrice,
                isPending: false
            };
            setItems(newItems);
            delete (window as any).pendingItemIndex;
        } else {
            setItems([...items, {
                variantId: newVariant.id,
                name: newVariant.product?.name || "Sản phẩm mới",
                size: newVariant.size,
                color: newVariant.color,
                quantity: 1,
                costPrice: Number(newVariant.price) || 0
            }]);
        }
        mutateVariants();
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!supplierName) {
            toast({
                title: "Lưu ý",
                message: "Vui lòng nhập tên nhà cung cấp",
                variant: "warning"
            });
            return;
        }

        try {
            if (initialData) {
                await updateInvoice({
                    id: initialData.id,
                    data: {
                        supplierName,
                        notes
                    }
                });
            } else {
                if (items.length === 0) {
                    toast({
                        title: "Lưu ý",
                        message: "Vui lòng chọn ít nhất 1 sản phẩm để nhập hàng",
                        variant: "warning"
                    });
                    return;
                }

                await createInvoice({
                    invoiceNumber,
                    supplierName,
                    notes,
                    items: items.map(item => ({
                        variantId: item.variantId!,
                        quantity: item.quantity,
                        costPrice: item.costPrice
                    }))
                });
            }

            if (onSuccess) onSuccess();
            handleClose();
        } catch (err) {
            console.error(err);
        }
    };

    const handleClose = () => {
        setInvoiceNumber("");
        setSupplierName("");
        setNotes("");
        setItems([]);
        onClose();
    };

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

    return (
        <Modal
            onClose={handleClose}
            title={initialData ? "Chi tiết hóa đơn nhập hàng" : "Tạo hóa đơn nhập hàng"}
            headerActions={!initialData && (
                <label className={cn(
                    "flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-xl text-sm font-bold cursor-pointer hover:bg-violet-100 transition-all",
                    isScanning && "opacity-50 cursor-not-allowed"
                )}>
                    {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {isScanning ? "Đang quét..." : "Quét hóa đơn OCR"}
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleScanInvoice}
                        disabled={isScanning}
                    />
                </label>
            )}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-violet-500" />
                            Số hóa đơn
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none disabled:opacity-70"
                            placeholder="Ví dụ: HD001..."
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            required
                            disabled={!!initialData}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            <User className="w-4 h-4 text-violet-500" />
                            Nhà cung cấp
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none"
                            placeholder="Tên nhà cung cấp..."
                            value={supplierName}
                            onChange={(e) => setSupplierName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-violet-500" />
                            Ghi chú
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none"
                            placeholder="Nhập ghi chú nếu có..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[14px] font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                        <Package className="w-4 h-4 text-violet-500" />
                        Sản phẩm nhập kho
                    </label>

                    {!initialData && (
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <SearchableSelect
                                    options={variantOptions}
                                    onSearch={setVariantSearch}
                                    isLoading={isLoadingVariants}
                                    onChange={handleAddVariant}
                                    placeholder="Tìm kiếm sản phẩm theo tên, màu, size..."
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setQuickProductName(variantSearch);
                                    setIsQuickProductModalOpen(true);
                                }}
                                className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-2xl font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo sản phẩm mới
                            </button>
                        </div>
                    )}

                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                        <th className="px-6 py-4 text-[13px] font-bold text-zinc-500 uppercase tracking-wider">Sản phẩm</th>
                                        <th className="px-6 py-4 text-[13px] font-bold text-zinc-500 uppercase tracking-wider w-32">Số lượng</th>
                                        <th className="px-6 py-4 text-[13px] font-bold text-zinc-500 uppercase tracking-wider w-44">Giá vốn</th>
                                        <th className="px-6 py-4 text-[13px] font-bold text-zinc-500 uppercase tracking-wider w-40 text-right">Thành tiền</th>
                                        <th className="px-6 py-4 text-center w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-zinc-400">
                                                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                                Chưa có sản phẩm nào được chọn
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, index) => (
                                            <tr key={index} className={cn(
                                                "group hover:bg-white dark:hover:bg-zinc-900 transition-colors",
                                                item.isPending && "bg-amber-50/30 dark:bg-amber-500/5"
                                            )}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">
                                                                {item.name}
                                                            </div>
                                                            <div className="text-[12px] text-zinc-500">
                                                                {item.size} / {item.color}
                                                            </div>
                                                        </div>
                                                        {item.isPending && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setQuickProductName(item.name);
                                                                    setQuickProductSize(item.size);
                                                                    setQuickProductColor(item.color);
                                                                    setIsQuickProductModalOpen(true);
                                                                    (window as any).pendingItemIndex = index;
                                                                }}
                                                                className="px-3 py-1.5 bg-amber-500 text-white text-[11px] font-black rounded-lg hover:bg-amber-600 transition-all uppercase tracking-wider animate-pulse"
                                                                title="Sản phẩm này chưa có trong hệ thống. Nhấn để tạo nhanh."
                                                            >
                                                                Tạo ngay
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none transition-all disabled:opacity-70"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateItem(index, "quantity", parseInt(e.target.value) || 0)}
                                                        disabled={!!initialData}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="relative">
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-zinc-400">đ</span>
                                                        <input
                                                            type="text"
                                                            className="w-full pr-8 pl-2 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-violet-500/20 outline-none transition-all disabled:opacity-70 font-medium text-violet-600"
                                                            value={new Intl.NumberFormat('vi-VN').format(item.costPrice)}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/\D/g, "");
                                                                handleUpdateItem(index, "costPrice", Number(value) || 0);
                                                            }}
                                                            disabled={!!initialData}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-zinc-900 dark:text-white">
                                                    {(item.quantity * item.costPrice).toLocaleString()}đ
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {!initialData && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {items.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-zinc-100/50 dark:bg-zinc-950/50">
                                            <td colSpan={3} className="px-6 py-4 text-right font-bold text-zinc-500">Tổng cộng:</td>
                                            <td className="px-6 py-4 text-right font-black text-xl text-violet-600 dark:text-violet-400">
                                                {totalAmount.toLocaleString()}đ
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-6 py-3 text-[15px] font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"
                    >
                        {initialData ? "Đóng" : "Hủy bỏ"}
                    </button>
                    <button
                        type="submit"
                        disabled={isCreating || isUpdating || items.some(item => item.isPending)}
                        className={cn(
                            "px-8 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-violet-500/25 transition-all active:scale-95",
                            items.some(item => item.isPending) && "opacity-50 grayscale cursor-not-allowed"
                        )}
                    >
                        {isCreating || isUpdating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {initialData ? "Cập nhật hóa đơn" : "Lưu hóa đơn"}
                    </button>
                </div>
            </form>

            {isQuickProductModalOpen && (
                <QuickProductModal
                    onClose={() => setIsQuickProductModalOpen(false)}
                    onSuccess={handleQuickCreateSuccess}
                    initialName={quickProductName}
                    initialSize={quickProductSize}
                    initialColor={quickProductColor}
                />
            )}
        </Modal>
    );
}
