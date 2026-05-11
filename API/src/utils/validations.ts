import { z } from 'zod';

// ============ AUTH SCHEMAS ============
export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
});

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

// ============ CATEGORY SCHEMAS ============
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

// ============ COLLECTION SCHEMAS ============
export const createCollectionSchema = z.object({
  name: z.string().min(2, 'Tên bộ sưu tập phải có ít nhất 2 ký tự'),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  productIds: z.array(z.string().uuid()).optional(),
});

export const updateCollectionSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  productIds: z.array(z.string().uuid()).optional(),
});

// ============ PRODUCT SCHEMAS ============
const variantItemSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().min(1, 'Size không được để trống'),
  color: z.string().min(1, 'Màu sắc không được để trống'),
  price: z.coerce.number().min(1, 'Giá phải từ 1'),
  stock: z.coerce.number().int().min(0, 'Số lượng không được âm'),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
  slug: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
  categoryId: z.string().uuid('Category ID không hợp lệ'),
  collectionIds: z.array(z.string().uuid()).optional(),
  variants: z.array(variantItemSchema).min(1, 'Cần ít nhất 1 biến thể').optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().uuid().optional(),
  collectionIds: z.array(z.string().uuid()).optional(),
  variants: z.array(variantItemSchema).optional(),
});

// ============ VARIANT SCHEMAS ============
export const createVariantSchema = z.object({
  productId: z.string().uuid('Product ID không hợp lệ'),
  size: z.string().min(1, 'Size không được để trống'),
  color: z.string().min(1, 'Màu sắc không được để trống'),
  price: z.coerce.number().min(1, 'Giá phải từ 1').max(999999999, 'Giá tối đa 999,999,999'),
  stock: z.coerce.number().int().min(1, 'Số lượng phải từ 1').max(999999999, 'Số lượng tối đa 999,999,999'),
});

export const updateVariantSchema = z.object({
  size: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  price: z.coerce.number().min(1, 'Giá phải từ 1').max(999999999, 'Giá tối đa 999,999,999').optional(),
  stock: z.coerce.number().int().min(1, 'Số lượng phải từ 1').max(999999999, 'Số lượng tối đa 999,999,999').optional(),
});

// ============ CART SCHEMAS ============
export const addToCartSchema = z.object({
  variantId: z.string().uuid('Variant ID không hợp lệ'),
  quantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
});

// ============ ORDER SCHEMAS ============
export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Tên khách hàng phải có ít nhất 2 ký tự'),
  customerPhone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 ký tự'),
  customerEmail: z.string().email('Email không hợp lệ').optional(),
  shippingAddress: z.string().min(10, 'Địa chỉ phải có ít nhất 10 ký tự'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['COD', 'VNPAY']).default('COD'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'CANCELLED']),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
});

// ============ MESSAGE SCHEMAS ============
export const sendMessageSchema = z.object({
  receiverId: z.string().uuid('Receiver ID không hợp lệ'),
  content: z.string().min(1, 'Nội dung tin nhắn không được để trống'),
});

// ============ PURCHASE INVOICE SCHEMAS ============
export const createPurchaseInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Số hóa đơn không được để trống'),
  supplierId: z.string().optional(),
  supplierName: z.string().min(2, 'Tên nhà cung cấp phải có ít nhất 2 ký tự'),
  supplierPhone: z.string().optional(),
  supplierAddress: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    variantId: z.string().uuid('Variant ID không hợp lệ'),
    quantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
    costPrice: z.number().positive('Giá nhập phải lớn hơn 0'),
  })).min(1, 'Cần ít nhất 1 sản phẩm'),
});

export const updatePurchaseInvoiceSchema = z.object({
  supplierId: z.string().optional(),
  supplierName: z.string().min(2).optional(),
  supplierPhone: z.string().optional(),
  supplierAddress: z.string().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});
