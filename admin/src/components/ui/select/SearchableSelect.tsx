"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string | number;
}

interface SearchableSelectProps {
  options: Option[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  onSearch?: (term: string) => void;
  isLoading?: boolean;
  className?: string;
  error?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Chọn một tùy chọn...",
  onSearch,
  isLoading = false,
  className,
  error,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
    if (onSearch) onSearch("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
    if (onSearch) onSearch("");
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-between w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl cursor-pointer transition-all hover:border-violet-500/50",
          isOpen && "border-violet-500 ring-4 ring-violet-500/10 shadow-sm",
          error && "border-red-500 ring-4 ring-red-500/10",
          !selectedOption && "text-zinc-400"
        )}
      >
        <span className="truncate text-[15px]">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selectedOption && (
            <X
              onClick={clearSelection}
              className="w-4 h-4 text-zinc-400 hover:text-red-500 transition-colors"
            />
          )}
          <ChevronDown
            className={cn(
              "w-5 h-5 text-zinc-400 transition-transform duration-300",
              isOpen && "rotate-180 text-violet-500"
            )}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] shadow-2xl shadow-violet-500/10 overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border-none rounded-xl focus:ring-2 focus:ring-violet-500/20 text-[14px] outline-none"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="max-h-[280px] overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-zinc-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span className="text-sm">Đang tải dữ liệu...</span>
              </div>
            ) : options.length > 0 ? (
              options.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all text-[14px]",
                    option.value === value
                      ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && <Check className="w-4 h-4" />}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-400 text-sm">
                Không tìm thấy kết quả nào
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 ml-2 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
