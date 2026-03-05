
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  const allocated = await prisma.consumer.count({
    where: {
      allocatedPercentage: { gt: 0 },
      NOT: { generatorId: null }
    }
  });

  console.log(`Global consumers with percentage > 0 and generator: ${allocated}`);

  if (allocated > 0) {
    const sample = await prisma.consumer.findFirst({
      where: {
        allocatedPercentage: { gt: 0 },
        NOT: { generatorId: null }
      },
      include: { generator: true, Representative: true }
    });
    console.log('Sample allocated consumer:', sample.name, 'Rep:', sample.Representative?.name, '%:', sample.allocatedPercentage);
  }
}

main().finally(() => prisma.$disconnect());
