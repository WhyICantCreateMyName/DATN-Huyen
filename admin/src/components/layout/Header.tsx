"use client";

import React from "react";
import { Search, Bell, Moon, Sun, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { useTheme } from "@/contexts/ThemeProvider";

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="hidden md:flex items-center flex-1 max-w-md">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-violet-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm mọi thứ..."
            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-2.5 pl-11 pr-4 text-[15px] transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5 ml-auto">
        <button className="p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors relative group">
          <Bell className="w-6 h-6 group-hover:text-violet-600 transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm"></span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
        >
          {theme === "light" ? (
            <Moon className="w-6 h-6 group-hover:text-violet-500 transition-colors" />
          ) : (
            <Sun className="w-6 h-6 group-hover:text-amber-500 transition-colors" />
          )}
        </button>

        <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3.5 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-base font-bold text-zinc-900 dark:text-white leading-tight">
              {user?.name || "Admin"}
            </p>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Quản trị</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 font-extrabold border border-violet-200 dark:border-violet-500/30 shadow-sm">
            {user?.name?.charAt(0) || "A"}
          </div>
        </div>
      </div>
    </header>
  );
}
