
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  const consumers = await prisma.consumer.findMany({
    where: { name: { contains: 'Wilian', mode: 'insensitive' } },
    include: { Representative: true }
  });

  consumers.forEach(c => {
    console.log(`Consumer: ${c.name} | Rep: ${c.Representative?.name} | status: ${c.status} | %: ${c.allocatedPercentage} | Gen: ${c.generatorId}`);
  });
}

main().finally(() => prisma.$disconnect());
