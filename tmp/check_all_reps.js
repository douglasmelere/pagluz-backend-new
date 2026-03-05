
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
    include: {
      Consumer: {
        include: { generator: true }
      }
    }
  });

  console.log(`Checking ${reps.length} representatives\n`);

  reps.forEach(rep => {
    const consumers = rep.Consumer;
    let totalKwh = 0;
    let allocatedKwh = 0;
    let countMatch = 0;

    consumers.forEach(c => {
      const kwh = Number(c.averageMonthlyConsumption) || 0;
      totalKwh += kwh;

      const status = String(c.status).toUpperCase();
      const isAllocatedLike = status === 'ALLOCATED' || status === 'CONVERTED';
      const percent = Number(c.allocatedPercentage) || 0;
      const hasGenerator = !!c.generatorId;

      const isMatch = isAllocatedLike && percent > 0 && hasGenerator;

      if (isMatch) {
        countMatch++;
        allocatedKwh += (kwh * percent) / 100;
      }
    });

    const rate = totalKwh > 0 ? (allocatedKwh / totalKwh) * 100 : 0;
    if (rate > 0 || consumers.length > 0) {
      console.log(`Rep: ${rep.name.padEnd(20)} | Consumers: ${consumers.length} | Rate: ${rate.toFixed(2)}% | Total kWh: ${totalKwh.toFixed(0)}`);
    }
  });
}

main().finally(() => prisma.$disconnect());
