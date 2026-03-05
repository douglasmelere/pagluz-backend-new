
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

  console.log(`Verificando ${consumers.length} consumidores de ${yago.name}\n`);

  let totalKwh = 0;
  let allocatedKwh = 0;
  let countAllocated = 0;

  consumers.forEach(c => {
    const kwh = Number(c.averageMonthlyConsumption) || 0;
    totalKwh += kwh;

    const status = String(c.status).toUpperCase();
    const isAllocatedLike = status === 'ALLOCATED' || status === 'CONVERTED';
    const percent = Number(c.allocatedPercentage) || 0;
    const hasGenerator = !!c.generatorId;

    const isMatch = isAllocatedLike && percent > 0 && hasGenerator;

    if (isMatch) {
      countAllocated++;
      allocatedKwh += (kwh * percent) / 100;
    }

    console.log(`[${status}] ${c.name.padEnd(30)} | %: ${String(percent).padEnd(3)} | Gen: ${hasGenerator ? 'OK' : 'NO'} | kWh: ${kwh} | Match: ${isMatch ? 'YES' : 'NO'}`);
  });

  const rate = totalKwh > 0 ? (allocatedKwh / totalKwh) * 100 : 0;
  console.log(`\nTaxa de Alocação: ${rate}%`);
  console.log(`Total kWh: ${totalKwh}`);
  console.log(`Allocated kWh: ${allocatedKwh}`);
  console.log(`Count Match: ${countAllocated}`);
}

main().finally(() => prisma.$disconnect());
