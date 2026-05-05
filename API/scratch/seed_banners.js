const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedBannerSlider() {
  const sliderData = {
    name: "Trang chủ - Xuân Hè 2026",
    isActive: true,
    items: [
      {
        title: "MÙA HÈ RỰC RỠ",
        subtitle: "SUMMER COLLECTION 2026",
        description: "Khám phá phong cách năng động với những thiết kế mới nhất dành cho mùa hè năm nay.",
        image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
        backgroundColor: "#EEF2FF",
        accentColor: "#6366f1",
        link: "/products"
      },
      {
        title: "TINH TẾ & SANG TRỌNG",
        subtitle: "LUXURY ESSENTIALS",
        description: "Đẳng cấp đến từ sự đơn giản. Những món đồ không thể thiếu trong tủ đồ của bạn.",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
        backgroundColor: "#FDF2F8",
        accentColor: "#ec4899",
        link: "/collections"
      },
      {
        title: "AI FASHION GUIDE",
        subtitle: "TƯ VẤN BỞI AI",
        description: "Hãy để trí tuệ nhân tạo giúp bạn tìm ra phong cách phù hợp nhất với bản thân.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop",
        backgroundColor: "#F0FDF4",
        accentColor: "#22c55e",
        link: "/ai-stylist"
      }
    ]
  };

  // Clean old sliders first
  await prisma.bannerSlider.deleteMany({});

  await prisma.bannerSlider.create({ data: sliderData });

  console.log('✅ Banner Slider seeded successfully');
}

seedBannerSlider()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
