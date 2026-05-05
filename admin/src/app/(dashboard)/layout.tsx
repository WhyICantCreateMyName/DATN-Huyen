"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Loading } from "@/components/ui/Loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, error } = useAuth() as any;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading && !isAuthenticated) {
    return <Loading fullScreen message="Đang xác thực quyền truy cập..." />;
  }

  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900/20">
      <Sidebar />

      <div className="flex-1 flex flex-col transition-all duration-300 lg:pl-64 group-has-[aside.w-20]:lg:pl-20">
        <Header />

        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <style jsx global>{`
        body:has(aside.w-20) .lg\:pl-64 {
            padding-left: 5rem !important;
        }
      `}</style>
    </div>
  );
}
