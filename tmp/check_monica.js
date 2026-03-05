
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  const monica = await prisma.representative.findFirst({
    where: { name: { contains: 'Monica', mode: 'insensitive' } },
  });

  if (!monica) {
    console.error('Monica não encontrada!');
    return;
  }

  const consumers = await prisma.consumer.findMany({
    where: { representativeId: monica.id },
    include: { generator: true }
  });

  console.log(`Verificando 1 consumidor de ${monica.name}\n`);
  console.log(JSON.stringify(consumers[0], null, 2));

}

main().finally(() => prisma.$disconnect());
