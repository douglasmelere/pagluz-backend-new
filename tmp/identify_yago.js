
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  const reps = await prisma.representative.findMany({
    where: { name: { contains: 'Yago', mode: 'insensitive' } }
  });
  console.log(JSON.stringify(reps, null, 2));
}

main().finally(() => prisma.$disconnect());
