import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type OrderStatus = "PENDING" | "PROCESSING" | "DELIVERING" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu cho Yuki Fashion Store...');

  console.log('🗑️  Đang dọn dẹp Database...');
  await prisma.message.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.purchaseInvoiceItem.deleteMany();
  await prisma.purchaseInvoice.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('👤 Đang tạo tài khoản mẫu...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      password: hashedPassword,
      name: 'Quản trị viên Yuki',
      role: 'ADMIN',
    },
  });

  const testUser = await prisma.user.create({
    data: {
      email: 'khachhang@gmail.com',
      password: hashedPassword,
      name: 'Nguyễn Hoàng Nam',
      role: 'USER',
    },
  });

  console.log('📁 Đang tạo danh mục sản phẩm...');
  const categoriesData = [
    { name: 'Áo Polo & T-Shirt', slug: 'ao-thun-polo', description: 'Các mẫu áo thun năng động và áo polo lịch lãm cho mọi dịp.' },
    { name: 'Sơ Mi Nam Oxford', slug: 'so-mi-nam', description: 'Dòng sơ mi cao cấp với chất liệu Oxford và Bamboo kháng khuẩn.' },
    { name: 'Quần Jeans & Kaki', slug: 'quan-nam', description: 'Thiết kế bền bỉ, giữ form tốt, đa dạng từ Slim-fit đến Regular.' },
    { name: 'Áo Khoác & Hoodie', slug: 'ao-khoac', description: 'Thời trang Thu Đông với các mẫu Bomber, Windbreaker và Hoodie.' },
    { name: 'Phụ Kiện Thời Trang', slug: 'phu-kien', description: 'Thắt lưng da thật, ví cầm tay và tất cotton kháng khuẩn.' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const createdCategory = await prisma.category.create({ data: cat });
    categories.push(createdCategory);
  }

  const adjs = ['Cao Cấp', 'Kháng Khuẩn', 'Thoáng Khí', 'Co Giãn 4 Chiều', 'Chống Nhăn', 'Basic', 'Premium', 'Streetwear'];
  const colors = ['Xanh Midnight', 'Xám Tiêu', 'Be Sand', 'Đen JetBlack', 'Trắng Optical', 'Xanh Olive', 'Nâu Cafe'];
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  const productNames = {
    'ao-thun-polo': ['Áo Polo Excool', 'T-shirt Cotton Compact', 'Áo Polo Pique Pro', 'T-shirt Graphic Oversize'],
    'so-mi-nam': ['Sơ Mi Oxford Button-Down', 'Sơ Mi Bamboo Dài Tay', 'Sơ Mi Linen Thoáng Mát', 'Sơ Mi Flannel Kẻ Caro'],
    'quan-nam': ['Quần Jean Slim-fit Wax', 'Quần Kaki Chino Pro', 'Quần Short Jogger Năng Động', 'Quần Tây Âu Luxury'],
    'ao-khoac': ['Áo Bomber Minimalist', 'Hoodie Nỉ Chân Cua', 'Áo Gió Chống Nước', 'Áo Khoác Jean Denim'],
    'phu-kien': ['Thắt Lưng Da Bò Ý', 'Ví Da Saffiano', 'Tất Cotton Khử Mùi', 'Mũ Lưỡi Trai Classic'],
  };

  const fashionImages = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c',
    'https://images.unsplash.com/photo-1624371414361-e6e8ea06255c',
    'https://images.unsplash.com/photo-1542272604-787c3835535d',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5',
    'https://images.unsplash.com/photo-1618333234901-b35835ebdf71',
    'https://images.unsplash.com/photo-1515347669655-b0f68ac3d366'
  ];

  function generateRealDescription(name: string, catName: string) {
    return `
### 🌟 ĐẶC ĐIỂM NỔI BẬT: ${name}
Sản phẩm thuộc bộ sưu tập mới nhất của **Yuki Fashion**, tập trung vào sự thoải mái và phong cách tối giản nhưng sang trọng.

### 🧵 CHI TIẾT CHẤT LIỆU
- **Thành phần**: 95% Cotton tự nhiên, 5% Spandex giúp co giãn linh hoạt.
- **Công nghệ**: Xử lý bề mặt vải chống xù lông, giữ màu bền bỉ sau nhiều lần giặt.
- **Đặc tính**: Thấm hút mồ hôi cực tốt, phù hợp cho cả đi làm lẫn dạo phố.

### 📐 HƯỚNG DẪN CHỌN SIZE
Dựa trên chiều cao và cân nặng tiêu chuẩn của người Việt:
- **Size S**: 48 - 55kg | 1m55 - 1m62
- **Size M**: 56 - 65kg | 1m63 - 1m70
- **Size L**: 66 - 75kg | 1m71 - 1m78
- **Size XL**: 76 - 85kg | 1m79 - 1m85

### 🧼 HƯỚNG DẪN BẢO QUẢN
1. Giặt máy ở chế độ nhẹ, nhiệt độ nước bình thường.
2. Không sử dụng thuốc tẩy mạnh.
3. Phơi nơi thoáng mát, tránh ánh nắng trực tiếp để bảo vệ sợi vải.
    `.trim();
  }

  console.log('🔨 Đang tạo 50 sản phẩm chất lượng cao...');
  for (let i = 1; i <= 50; i++) {
    const cat = categories[i % categories.length];
    const baseNames = productNames[cat.slug as keyof typeof productNames] || ['Sản phẩm thời trang'];
    const baseName = baseNames[Math.floor(Math.random() * baseNames.length)];
    const adj = adjs[Math.floor(Math.random() * adjs.length)];
    const finalName = `${baseName} ${adj} #${i}`;

    const basePrice = Math.floor(Math.random() * 400000) + 150000;

    const images = [];
    for (let j = 0; j < 2; j++) {
      images.push(fashionImages[Math.floor(Math.random() * fashionImages.length)]);
    }

    await prisma.product.create({
      data: {
        name: finalName,
        description: generateRealDescription(finalName, cat.name),
        images: JSON.stringify(images),
        categoryId: cat.id,
        variants: {
          create: sizes.map(size => ({
            size,
            color: colors[Math.floor(Math.random() * colors.length)],
            price: basePrice + (size === 'XL' || size === 'XXL' ? 20000 : 0),
            stock: Math.floor(Math.random() * 50) + 10
          }))
        }
      }
    });

    if (i % 10 === 0) console.log(`   ✅ Đã tạo xong ${i}/50 sản phẩm...`);
  }

  await prisma.cart.create({
    data: { userId: testUser.id }
  });

  console.log('📦 Đang tạo đơn hàng mẫu...');
  const allVariants = await prisma.productVariant.findMany({
    include: { product: true },
    take: 20
  });

  const orderStatuses: OrderStatus[] = ["PENDING", "PROCESSING", "DELIVERING", "DELIVERED", "CANCELLED"];
  const paymentStatuses: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "REFUNDED"];

  for (let i = 1; i <= 10; i++) {
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
    
    const randomItemsCount = Math.floor(Math.random() * 3) + 1;
    const selectedVariants = allVariants.sort(() => 0.5 - Math.random()).slice(0, randomItemsCount);
    
    let totalAmount = 0;
    const orderItemsData = selectedVariants.map(v => {
      const qty = Math.floor(Math.random() * 2) + 1;
      const price = Number(v.price);
      totalAmount += price * qty;
      return {
        variantId: v.id,
        quantity: qty,
        price: price
      };
    });

    await prisma.order.create({
      data: {
        userId: testUser.id,
        totalAmount: totalAmount,
        status: status,
        paymentStatus: paymentStatus,
        customerName: `Khách hàng mẫu #${i}`,
        customerPhone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        customerEmail: `customer${i}@example.com`,
        shippingAddress: `${i * 123} Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh`,
        notes: i % 3 === 0 ? "Giao hàng giờ hành chính giúp mình." : null,
        items: {
          create: orderItemsData
        }
      }
    });
  }

  console.log('✨ QUÁ TRÌNH SEED DỮ LIỆU HOÀN TẤT!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
