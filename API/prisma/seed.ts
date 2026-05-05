import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type OrderStatus = "PENDING" | "PROCESSING" | "DELIVERING" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

const reviewComments = [
  "Sản phẩm tuyệt vời, chất vải rất đẹp và mịn!",
  "Giao hàng cực nhanh, đóng gói cẩn thận chuyên nghiệp.",
  "Mặc rất vừa vặn, tôn dáng và sang trọng lắm.",
  "Màu sắc hơi khác so với ảnh một chút nhưng vẫn rất ưng ý.",
  "Đáng đồng tiền bát gạo, chắc chắn sẽ ủng hộ shop tiếp.",
  "Chất lượng ổn, đường may sắc sảo, phù hợp giá tiền.",
  "Váy đẹp lắm shop ơi, mặc đi tiệc ai cũng khen.",
  "Shop tư vấn nhiệt tình, size chuẩn, 5 sao nhé!",
  "Vải mát, không bị nhăn sau khi giặt, rất hài lòng.",
  "Phong cách rất hiện đại, đúng gu mình tìm bấy lâu.",
  "Hàng y hình, chất lượng vượt mong đợi.",
  "Dịch vụ chăm sóc khách hàng của shop quá tốt."
];

async function main() {
  console.log('🌱 Bắt đầu khởi tạo dữ liệu mẫu toàn diện cho Yuki Fashion Store...');

  console.log('🗑️  Đang dọn dẹp Database...');
  await prisma.review.deleteMany();
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

  const admin = await prisma.user.create({
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

  // Create 20 more random users for dashboard variety
  const additionalUsers = [];
  for (let i = 1; i <= 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        password: hashedPassword,
        name: `Khách hàng #${i}`,
        role: 'USER',
        phone: `090${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
        address: `${Math.floor(Math.random() * 500)} Đường Lê Lợi, TP.HCM`
      }
    });
    additionalUsers.push(user);
  }
  const allCustomers = [testUser, ...additionalUsers];

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

  console.log('🔨 Đang tạo 50 sản phẩm chất lượng cao...');
  const createdProducts = [];
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

    const product = await prisma.product.create({
      data: {
        name: finalName,
        description: `### 🌟 ĐẶC ĐIỂM NỔI BẬT: ${finalName}\nSản phẩm cao cấp của Yuki Fashion.`,
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
      },
      include: { variants: true }
    });
    createdProducts.push(product);

    if (i % 10 === 0) console.log(`   ✅ Đã tạo xong ${i}/50 sản phẩm...`);
  }

  console.log('⭐ Đang tạo 200 đánh giá khách hàng...');
  const reviewsData = [];
  for (let i = 0; i < 200; i++) {
    const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
    const randomUser = allCustomers[Math.floor(Math.random() * allCustomers.length)];

    const rand = Math.random();
    let rating = 5;
    if (rand < 0.1) rating = 3;
    else if (rand < 0.3) rating = 4;
    else rating = 5;

    reviewsData.push({
      productId: randomProduct.id,
      userId: randomUser.id,
      rating: rating,
      comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
    });
  }
  await prisma.review.createMany({ data: reviewsData });

  console.log('📦 Đang tạo 100 đơn hàng lịch sử (Dashboard)...');
  const orderStatuses: OrderStatus[] = ["PENDING", "PROCESSING", "DELIVERING", "DELIVERED", "CANCELLED"];
  const paymentStatuses: PaymentStatus[] = ["PENDING", "PAID", "FAILED", "REFUNDED"];
  const now = new Date();

  for (let i = 1; i <= 100; i++) {
    const randomUser = allCustomers[Math.floor(Math.random() * allCustomers.length)];
    const randomDate = new Date();
    randomDate.setDate(now.getDate() - Math.floor(Math.random() * 30));

    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

    const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
    const variant = randomProduct.variants[0];

    const qty = Math.floor(Math.random() * 2) + 1;
    const price = Number(variant.price);

    await prisma.order.create({
      data: {
        userId: randomUser.id,
        totalAmount: price * qty,
        status: status,
        paymentStatus: paymentStatus,
        customerName: randomUser.name,
        customerPhone: randomUser.phone || '0900000000',
        customerEmail: randomUser.email,
        shippingAddress: randomUser.address || 'Hồ Chí Minh',
        paymentMethod: Math.random() > 0.5 ? "COD" : "VNPAY",
        createdAt: randomDate,
        items: {
          create: [{
            variantId: variant.id,
            quantity: qty,
            price: price
          }]
        }
      }
    });
  }

  console.log('💬 Đang tạo tin nhắn mẫu...');
  for (let i = 0; i < 15; i++) {
    const randomUser = allCustomers[Math.floor(Math.random() * allCustomers.length)];
    await prisma.message.create({
      data: {
        senderId: randomUser.id,
        receiverId: admin.id,
        content: "Shop ơi tư vấn giúp mình mẫu sơ mi mới nhất với ạ!",
        senderType: 'USER',
        createdAt: new Date(now.getTime() - Math.floor(Math.random() * 48 * 60 * 60 * 1000))
      }
    });
  }

  console.log('✨ QUÁ TRÌNH SEED TỔNG THỂ HOÀN TẤT!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
