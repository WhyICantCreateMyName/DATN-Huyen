"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth as useAuthHook, useAuthActions } from "@/hooks/use-auth";
import { AuthType } from "@/types";

interface AuthContextType {
  user: AuthType.User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: any;
  login: (data: AuthType.LoginInput) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { useToast } from "@/contexts/ToastProvider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: user, isLoading, error, mutate } = useAuthHook();
  const { login: loginMutation, logout: logoutAction } = useAuthActions();

  const isAuthenticated = !!user;

  const login = async (data: AuthType.LoginInput) => {
    try {
      const status = await loginMutation(data);

      if (status === 200) {
        toast({
          title: "Đăng nhập thành công",
          message: "Chào mừng bạn quay trở lại hệ thống quản trị.",
          variant: "success"
        });
        await mutate();
        return { success: true };
      }
      return { success: false };
    } catch (error: any) {
      const status = error.response?.status;
      let errorMessage = error.message || "Đã có lỗi xảy ra khi đăng nhập.";
      let variant: any = "error";

      if (status === 401) {
        errorMessage = "Email hoặc mật khẩu không chính xác.";
      } else if (status === 403) {
        errorMessage = "Bạn không có quyền truy cập vào hệ thống này.";
        variant = "warning";
      } else if (status === 404) {
        errorMessage = "Tài khoản không tồn tại trên hệ thống.";
      } else if (status === 400) {
        errorMessage = "Thông tin đăng nhập không hợp lệ.";
      }

      toast({
        title: "Đăng nhập thất bại",
        message: errorMessage,
        variant
      });

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    await logoutAction();
    toast({
      title: "Đã đăng xuất",
      message: "Phiên làm việc của bạn đã kết thúc.",
      variant: "tip"
    });
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        isAuthenticated,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
