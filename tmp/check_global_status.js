
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  const statusCounts = await prisma.consumer.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  console.log('Consumer Status counts:');
  console.log(JSON.stringify(statusCounts, null, 2));

  const sample = await prisma.consumer.findMany({
    take: 5,
    select: {
      name: true,
      status: true,
      approvalStatus: true
    }
  });
  console.log('\nSample consumers:');
  console.log(JSON.stringify(sample, null, 2));
}

main().finally(() => prisma.$disconnect());
