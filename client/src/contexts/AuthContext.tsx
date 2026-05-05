"use client";

import React, { createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth as useAuthHook, useAuthActions } from '@/hooks/use-auth';
import { AuthType } from '@/types';

interface AuthContextType {
  user: AuthType.User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: AuthType.LoginInput) => Promise<any>;
  register: (data: AuthType.RegisterInput) => Promise<any>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (data: any) => Promise<void>;
  updateProfile: (data: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { data: user, isLoading: loading, mutate } = useAuthHook();
  const {
    login: loginMutation,
    register: registerMutation,
    logout: logoutAction,
    forgotPassword: forgotAction,
    resetPassword: resetAction,
    updateProfile: updateProfileAction
  } = useAuthActions();

  const isAuthenticated = !!user;

  const login = async (data: AuthType.LoginInput) => {
    try {
      const status = await loginMutation(data);
      if (status === 200 || status === 201) {
        return { success: true };
      }
      return { success: false };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Đăng nhập thất bại' };
    }
  };

  const register = async (data: AuthType.RegisterInput) => {
    try {
      const status = await registerMutation(data);
      if (status === 200 || status === 201) {
        return { success: true };
      }
      return { success: false };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Đăng ký thất bại' };
    }
  };

  const logout = async () => {
    await logoutAction();
    await mutate(null, false);
    router.push('/login');
  };

  const forgotPassword = async (email: string) => {
    await forgotAction(email);
  };

  const resetPassword = async (data: any) => {
    await resetAction(data);
  };

  const updateProfile = async (data: AuthType.UpdateUserInput) => {
    try {
      const status = await updateProfileAction(data);
      if (status === 200) return { success: true };
      return { success: false };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Cập nhật thất bại' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
