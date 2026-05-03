import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Using Inter as a standard premium font, or we can use Geist
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Yuki | Admin",
    template: "%s | Yuki"
  },
  description: "Admin Dashboard",
};

import { AuthProvider } from "@/contexts/AuthProvider";
import { LoadingProvider } from "@/contexts/LoadingProvider";
import { ToastProvider } from "@/contexts/ToastProvider";
import { ThemeProvider } from "@/contexts/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
        <ThemeProvider>
          <ToastProvider>
            <LoadingProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </LoadingProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
