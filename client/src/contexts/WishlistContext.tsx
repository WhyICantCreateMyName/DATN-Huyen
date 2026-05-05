"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductType } from '@/types';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { wishlistService } from '@/services/wishlist.service';

interface WishlistContextType {
  wishlist: ProductType.Product[];
  toggleWishlist: (product: ProductType.Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [localWishlist, setLocalWishlist] = useState<ProductType.Product[]>([]);
  const [apiWishlist, setApiWishlist] = useState<ProductType.Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Load local wishlist
  useEffect(() => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem('yuki_wishlist');
      if (saved) {
        try {
          setLocalWishlist(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse wishlist', e);
        }
      }
    }
  }, [isAuthenticated]);

  // Load API wishlist
  useEffect(() => {
    if (isAuthenticated) {
      const fetchWishlist = async () => {
        setIsLoading(true);
        try {
          const res = await wishlistService.getWishlist();
          setApiWishlist(res.data.data);
        } catch (e) {
          console.error('Failed to fetch wishlist', e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchWishlist();
    }
  }, [isAuthenticated]);

  // Save local wishlist
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('yuki_wishlist', JSON.stringify(localWishlist));
    }
  }, [localWishlist, isAuthenticated]);

  const toggleWishlist = async (product: ProductType.Product) => {
    if (isAuthenticated) {
      try {
        const isExist = apiWishlist.find(p => p.id === product.id);
        await wishlistService.toggleWishlist(product.id);
        
        if (isExist) {
          setApiWishlist(prev => prev.filter(p => p.id !== product.id));
          toast({ title: "Đã xóa", message: `Đã xóa ${product.name} khỏi yêu thích.`, variant: "warning" });
        } else {
          setApiWishlist(prev => [product, ...prev]);
          toast({ title: "Đã thêm", message: `Đã thêm ${product.name} vào yêu thích.`, variant: "success" });
        }
      } catch (e) {
        toast({ title: "Lỗi", message: "Không thể cập nhật danh sách yêu thích.", variant: "error" });
      }
    } else {
      setLocalWishlist(prev => {
        const isExist = prev.find(p => p.id === product.id);
        if (isExist) {
          toast({ title: "Đã xóa", message: `Đã xóa ${product.name} khỏi yêu thích.`, variant: "warning" });
          return prev.filter(p => p.id !== product.id);
        } else {
          toast({ title: "Đã thêm", message: `Đã thêm ${product.name} vào yêu thích.`, variant: "success" });
          return [product, ...prev];
        }
      });
    }
  };

  const isInWishlist = (productId: string) => {
    const list = isAuthenticated ? apiWishlist : localWishlist;
    return list.some(p => p.id === productId);
  };

  const wishlist = isAuthenticated ? apiWishlist : localWishlist;

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
