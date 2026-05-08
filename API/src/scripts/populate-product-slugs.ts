import { PrismaClient } from '@prisma/client';
import { slugify } from '../utils/url';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting to populate product slugs...');
  
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { slug: null },
        { slug: '' }
      ]
    }
  });

  console.log(`Found ${products.length} products needing slugs.`);

  for (const product of products) {
    const baseSlug = slugify(product.name);
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Check for collision
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

    console.log(`✅ Updated: ${product.name} -> ${uniqueSlug}`);
  }

  console.log('✨ All product slugs populated successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
