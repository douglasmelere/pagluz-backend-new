
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  const gens = await prisma.generator.findMany();
  gens.forEach(g => {
    console.log(`Gen: ${g.id} | ${g.ownerName}`);
  });
}

main().finally(() => prisma.$disconnect());
