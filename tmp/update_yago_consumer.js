
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  const consumer = await prisma.consumer.findFirst({
    where: { name: { contains: 'Wilian Risso', mode: 'insensitive' } }
  });

  if (!consumer) {
    console.error('Consumer Wilian Risso não encontrado!');
    return;
  }

  const updated = await prisma.consumer.update({
    where: { id: consumer.id },
    data: {
      status: 'ALLOCATED',
      allocatedPercentage: 100.0,
      generatorId: 'cmlie86ey0025ni01tcv1nnbo'
    }
  });

  console.log(`Updated consumer ${updated.name}: Status: ${updated.status}, %: ${updated.allocatedPercentage}, Gen: ${updated.generatorId}`);
}

main().finally(() => prisma.$disconnect());
