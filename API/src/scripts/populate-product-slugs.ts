import { PrismaClient } from '@prisma/client';
import { slugify } from '../utils/url';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Đang bắt đầu cập nhật slug cho sản phẩm...');

  // Lấy tất cả sản phẩm chưa có slug hoặc slug trống
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { slug: null },
        { slug: '' }
      ]
    }
  });

  console.log(`Tìm thấy ${products.length} sản phẩm cần cập nhật.`);

  for (const product of products) {
    const baseSlug = slugify(product.name);
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Xử lý trùng lặp slug
    while (true) {
      const collision = await prisma.product.findFirst({
        where: {
          slug: uniqueSlug,
          id: { not: product.id }
        }
      });

      if (!collision) break;
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { slug: uniqueSlug }
    });

    console.log(`✅ Đã cập nhật: ${product.name} -> ${uniqueSlug}`);
  }

  console.log('✨ Hoàn tất cập nhật slug cho tất cả sản phẩm!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
