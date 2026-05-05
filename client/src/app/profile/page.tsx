import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import ProfileContainer from '@/components/profile/ProfileContainer';

export const metadata: Metadata = {
  title: "Tài khoản của tôi | Yuki Fashion",
  description: "Quản lý thông tin cá nhân và danh sách sản phẩm yêu thích của bạn tại Yuki Fashion.",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <ProfileContainer />
    </div>
  );
}
