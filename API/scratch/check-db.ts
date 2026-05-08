import prisma from '../src/lib/prisma';

async function check() {
  try {
    const products = await prisma.product.findMany({ take: 1 });
    console.log('Success connecting to DB');
    console.log('Sample product:', products[0]);
  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
