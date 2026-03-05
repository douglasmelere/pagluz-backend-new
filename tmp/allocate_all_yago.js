
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  const yago = await prisma.representative.findFirst({
    where: { name: { contains: 'Yago', mode: 'insensitive' } }
  });

  const consumers = await prisma.consumer.findMany({
    where: { representativeId: yago.id }
  });

  const genId = 'cmlie86ey0025ni01tcv1nnbo';

  for (const c of consumers) {
    await prisma.consumer.update({
      where: { id: c.id },
      data: {
        status: 'ALLOCATED',
        allocatedPercentage: 100.0,
        generatorId: genId
      }
    });
  }
  console.log(`Updated all ${consumers.length} consumers for Yago`);
}

main().finally(() => prisma.$disconnect());
