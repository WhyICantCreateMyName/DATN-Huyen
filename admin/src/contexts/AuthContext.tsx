"use client";

import React, { createContext, useContext } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, error, mutate } = useAuthHook();
  const { login: loginMutation, logout: logoutAction } = useAuthActions();

  const isAuthenticated = !!user;

  const login = async (data: AuthType.LoginInput) => {
    try {
      const status = await loginMutation(data);
      if (status === 200) {
        return { success: true };
      }
      return { success: false };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await logoutAction();
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
