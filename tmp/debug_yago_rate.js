
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

  reps.forEach(rep => {
    if (rep.name.includes('Yago')) {
      console.log(`\nDEBUG Yago: ${rep.name}`);
      const consumers = rep.Consumer;
      let totalKwh = 0;
      let allocatedKwh = 0;

      consumers.forEach(c => {
        const kwh = Number(c.averageMonthlyConsumption) || 0;
        totalKwh += kwh;

        const status = String(c.status).toUpperCase();
        const isAllocatedLike = status === 'ALLOCATED' || status === 'CONVERTED';
        const percent = Number(c.allocatedPercentage) || 0;
        const hasGenerator = !!c.generatorId;

        const isMatch = isAllocatedLike && percent > 0 && hasGenerator;
        if (isMatch) {
          console.log(`  MATCH: ${c.name} | status: ${status} | %: ${percent} | gen: ${c.generatorId}`);
          allocatedKwh += (kwh * percent) / 100;
        }
      });
      const rate = totalKwh > 0 ? (allocatedKwh / totalKwh) * 100 : 0;
      console.log(`  Summary: Total kWh: ${totalKwh.toFixed(2)} | Allocated kWh: ${allocatedKwh.toFixed(2)} | Rate: ${rate.toFixed(2)}%`);
    }
  });
}

main().finally(() => prisma.$disconnect());
