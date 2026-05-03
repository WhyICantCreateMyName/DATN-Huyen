import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "sqlserver://localhost:1433;database=shoe_store;user=sa;password=YourStrong@Passw0rd;encrypt=true;trustServerCertificate=true;",
    },
  },
});

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Connection successful');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Users found:', users.length);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
