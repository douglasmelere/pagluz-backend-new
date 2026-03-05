
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  const gen = await prisma.generator.findFirst();
  if (gen) {
    console.log('Generator:', gen.id, gen.ownerName);
  } else {
    console.log('No generator found');
  }
}

main().finally(() => prisma.$disconnect());
