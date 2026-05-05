"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/product/ProductCard';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, Phone, Heart, LogOut, Package, Settings, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfileContainer() {
  const { user, logout, updateProfile } = useAuth();
  const { wishlist } = useWishlist();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateProfile(formData);
    if (result.success) {
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Sidebar / Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[60px] rounded-full -mr-16 -mt-16" />
            
            <div className="flex items-center gap-6 mb-10 relative">
              <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center text-3xl font-black shadow-lg shadow-accent/20">
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{user.name}</h2>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Hội viên cao cấp</p>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6 relative">
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 block mb-1">Họ tên</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="bg-transparent border-none p-0 w-full text-sm font-bold focus:ring-0 text-white"
                      placeholder="Nhập họ tên"
                    />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 block mb-1">Số điện thoại</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="bg-transparent border-none p-0 w-full text-sm font-bold focus:ring-0 text-white"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <label className="text-[8px] font-black uppercase tracking-widest text-white/40 block mb-1">Địa chỉ</label>
                    <textarea 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="bg-transparent border-none p-0 w-full text-sm font-bold focus:ring-0 text-white resize-none h-20"
                      placeholder="Nhập địa chỉ giao hàng"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="py-4 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="py-4 bg-accent hover:scale-105 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu lại'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 relative">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all">
                    <Mail className="w-4 h-4 text-white/60 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Email</p>
                    <p className="text-sm font-bold">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all">
                    <Phone className="w-4 h-4 text-white/60 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Điện thoại</p>
                    <p className="text-sm font-bold">{user.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all">
                    <MapPin className="w-4 h-4 text-white/60 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Địa chỉ</p>
                    <p className="text-sm font-bold line-clamp-1">{user.address || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditing(true)}
                  className="mt-12 w-full bg-white/10 hover:bg-white/20 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest group"
                >
                  <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Chỉnh sửa hồ sơ
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full bg-transparent hover:text-rose-500 py-3 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-6 rounded-[2.5rem] space-y-2">
            {[
              { icon: Package, label: 'Đơn hàng của tôi', link: '#' },
              { icon: Settings, label: 'Cài đặt tài khoản', link: '#' },
              { icon: Heart, label: 'Sản phẩm yêu thích', link: '#wishlist' },
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-4 hover:bg-white rounded-2xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <item.icon className="w-4 h-4 text-slate-400 group-hover:text-black transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-black">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-8">
          <header className="mb-12 flex items-end justify-between" id="wishlist">
            <div>
              <h2 className="text-5xl font-black tracking-tighter uppercase text-slate-900 leading-none mb-4">Danh sách yêu thích</h2>
              <div className="h-1.5 w-20 bg-accent" />
            </div>
            <span className="text-slate-300 font-bold text-xl">/ {wishlist.length}</span>
          </header>

          {wishlist.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem] py-32 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Heart className="w-8 h-8 text-slate-100" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-400 mb-2">Chưa có sản phẩm yêu thích</h3>
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Hãy bắt đầu khám phá và lưu lại những món đồ bạn thích</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {wishlist.map(product => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
