import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yuki Fashion | Modern Luxury Store",
  description: "Khám phá bộ sưu tập thời trang cao cấp từ Yuki Fashion. Trải nghiệm mua sắm hiện đại với trợ lý AI.",
};

import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import FloatingChat from "@/components/chat/FloatingChat";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background text-foreground antialiased"
        )}
      >
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                {children}
                <FloatingChat />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
