"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useCart as useCartHook } from '@/hooks/use-cart';
import { CartType } from '@/types';

interface CartContextType {
  items: CartType.CartItem[];
  addItem: (variant: any, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const {
    items: apiItems,
    totalAmount: apiTotalAmount,
    totalItems: apiTotalItems,
    isLoading: isApiLoading,
    addToCart: apiAddToCart,
    updateQuantity: apiUpdateQuantity,
    removeItem: apiRemoveItem,
    mutate: apiMutate
  } = useCartHook();

  const [localItems, setLocalItems] = useState<CartType.CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      const savedCart = localStorage.getItem('yuki_cart');
      if (savedCart) {
        try {
          setLocalItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse local cart', e);
        }
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('yuki_cart', JSON.stringify(localItems));
    }
  }, [localItems, isAuthenticated]);

  const addItem = async (variant: any, quantity: number) => {
    if (isAuthenticated) {
      await apiAddToCart({ variantId: variant.id, quantity });
    } else {
      setLocalItems(prev => {
        const existingItem = prev.find(item => item.variantId === variant.id);
        if (existingItem) {
          return prev.map(item =>
            item.variantId === variant.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        const newItem: CartType.CartItem = {
          id: `local_${Date.now()}`,
          cartId: 'guest',
          variantId: variant.id,
          quantity,
          variant: {
            ...variant,
            product: variant.product || { name: 'Sản phẩm', images: [] }
          },
          createdAt: new Date().toISOString()
        };
        return [...prev, newItem];
      });

      toast({
        title: "Đã thêm vào giỏ",
        message: "Sản phẩm đã được thêm vào giỏ hàng của bạn.",
        variant: "success"
      });
    }
  };

  const removeItem = async (id: string) => {
    if (isAuthenticated) await apiRemoveItem(id);
    else setLocalItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;
    if (isAuthenticated) await apiUpdateQuantity(id, quantity);
    else setLocalItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const refreshCart = async () => {
    if (isAuthenticated) await apiMutate();
  };

  const items = useMemo(() => {
    const rawItems = isAuthenticated ? apiItems : localItems;
    return [...rawItems].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }, [isAuthenticated, apiItems, localItems]);

  const totalItems = isAuthenticated ? apiTotalItems : localItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = isAuthenticated ? apiTotalAmount : localItems.reduce((sum, item) => sum + (Number(item.variant.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      refreshCart,
      totalItems,
      totalPrice,
      isLoading: isAuthenticated ? isApiLoading : false
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
