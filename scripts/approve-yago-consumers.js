const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  console.log('=== Aprovando consumidores PENDING do Yago ===\n');

  const yago = await prisma.representative.findFirst({
    where: { name: { contains: 'Yago', mode: 'insensitive' } },
  });

  if (!yago) {
    console.error('❌ Yago não encontrado!');
    process.exit(1);
  }

  console.log(`✅ Representante: ${yago.name} (ID: ${yago.id})\n`);

  // Atualiza todos os consumidores PENDING vinculados ao Yago para APPROVED
  const result = await prisma.consumer.updateMany({
    where: {
      representativeId: yago.id,
      approvalStatus: 'PENDING',
    },
    data: {
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
    },
  });

  console.log(`✅ ${result.count} consumidores aprovados com sucesso!`);

  // Exibe resumo por consumo (para saber quais vão gerar comissão)
  const consumers = await prisma.consumer.findMany({
    where: { representativeId: yago.id },
    select: {
      name: true,
      averageMonthlyConsumption: true,
      approvalStatus: true,
      commissions: { select: { id: true, commissionValue: true } },
    },
    orderBy: { averageMonthlyConsumption: 'desc' },
  });

  console.log('\n=== CONSUMIDORES COM COMISSÃO ELEGÍVEL (>= 600 kWh) ===');
  const eligible = consumers.filter(c => c.averageMonthlyConsumption >= 600);
  eligible.forEach(c => {
    console.log(`  ✅ ${c.name} — ${c.averageMonthlyConsumption} kWh`);
  });

  console.log('\n=== CONSUMIDORES SEM COMISSÃO (< 600 kWh) ===');
  const ineligible = consumers.filter(c => c.averageMonthlyConsumption < 600);
  ineligible.forEach(c => {
    console.log(`  ⚠️  ${c.name} — ${c.averageMonthlyConsumption} kWh`);
  });

  console.log(`\n📊 Elegíveis para comissão: ${eligible.length}`);
  console.log(`📊 Sem comissão (< 600 kWh): ${ineligible.length}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
