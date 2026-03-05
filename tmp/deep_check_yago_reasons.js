
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
    where: { name: { contains: 'Yago', mode: 'insensitive' } },
  });

  if (!yago) {
    console.error('Yago não encontrado!');
    return;
  }

  const consumers = await prisma.consumer.findMany({
    where: { representativeId: yago.id },
    include: { generator: true }
  });

  console.log(`Verificando 36 consumidores de ${yago.name}\n`);

  consumers.forEach(c => {
    const status = String(c.status).toUpperCase();
    const isAllocatedLike = status === 'ALLOCATED' || status === 'CONVERTED';
    const percent = Number(c.allocatedPercentage) || 0;
    const hasGenerator = !!c.generatorId;

    // Detailed analysis
    let reasons = [];
    if (!isAllocatedLike) reasons.push(`status-is-${status}`);
    if (percent <= 0) reasons.push(`percent-is-${percent}`);
    if (!hasGenerator) reasons.push(`no-generator-id`);

    if (reasons.length > 0) {
      console.log(`Consumer: ${c.name.padEnd(30)} | Reasons: ${reasons.join(', ')}`);
    } else {
      console.log(`Consumer: ${c.name.padEnd(30)} | MATCH OK!`);
    }
  });

}

main().finally(() => prisma.$disconnect());
