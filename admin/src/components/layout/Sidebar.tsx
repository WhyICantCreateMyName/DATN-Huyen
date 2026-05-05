"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  MessageSquare,
  Package,
  Layers,
  CreditCard,
  Image as ImageIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/" },
  { icon: Package, label: "Sản phẩm", href: "/product" },
  { icon: Layers, label: "Danh mục", href: "/category" },
  { icon: ShoppingBag, label: "Đơn hàng", href: "/order" },
  { icon: CreditCard, label: "Nhập hàng", href: "/purchase" },
  { icon: Users, label: "Khách hàng", href: "/customer" },
  { icon: MessageSquare, label: "Tin nhắn", href: "/message" },
  { icon: ImageIcon, label: "Banner", href: "/banner" },
  { icon: Settings, label: "Quản lý tài khoản", href: "/user" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-20 h-screen bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-100 dark:border-zinc-900">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Y</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-white">Yuki Admin</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xl">Y</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2.5 overflow-y-auto h-[calc(100vh-128px)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group",
                  isActive
                    ? "bg-violet-500 text-white font-semibold shadow-md shadow-violet-500/20"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                )}
              >
                <item.icon className={cn(
                  "w-6 h-6 transition-colors",
                  isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white"
                )} />
                {!isCollapsed && <span className="text-[15px]">{item.label}</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-6 px-3 py-1.5 bg-zinc-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
          {!isCollapsed && (
            <div className="flex items-center gap-3 px-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-bold border border-zinc-200 dark:border-zinc-700">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-base font-bold text-zinc-900 dark:text-white truncate">{user?.name || "Admin"}</p>
                <p className="text-xs text-zinc-500 truncate">{user?.email || "admin@yuki.com"}</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors group",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="w-6 h-6" />
            {!isCollapsed && <span className="font-bold text-[15px]">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {!isMobileOpen && (
        <button
          onClick={toggleMobileSidebar}
          className="fixed top-4 left-4 z-40 lg:hidden p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg text-zinc-600 dark:text-zinc-400"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
