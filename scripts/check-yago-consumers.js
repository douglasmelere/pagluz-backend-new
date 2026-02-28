require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  console.log('=== Verificando status dos consumidores do Yago ===\n');

  const yago = await prisma.representative.findFirst({
    where: { name: { contains: 'Yago', mode: 'insensitive' } },
  });

  if (!yago) {
    console.error('❌ Yago não encontrado!');
    process.exit(1);
  }

  console.log(`✅ Representante: ${yago.name} (ID: ${yago.id})\n`);

  const consumers = await prisma.consumer.findMany({
    where: { representativeId: yago.id },
    select: {
      id: true,
      name: true,
      approvalStatus: true,
      status: true,
      averageMonthlyConsumption: true,
      representativeId: true,
      commissions: { select: { id: true } },
    },
    orderBy: { name: 'asc' },
  });

  console.log(`Total de consumidores vinculados ao Yago: ${consumers.length}\n`);

  const statusGroups = {
    PENDING: [],
    APPROVED: [],
    REJECTED: [],
  };

  consumers.forEach(c => {
    const group = statusGroups[c.approvalStatus] || statusGroups['PENDING'];
    group.push(c);
    const commCount = c.commissions.length;
    console.log(
      `  [${c.approvalStatus}] ${c.name} | consumo: ${c.averageMonthlyConsumption} kWh | comissões: ${commCount}`
    );
  });

  console.log('\n=== RESUMO ===');
  console.log(`  PENDING:  ${statusGroups.PENDING.length}`);
  console.log(`  APPROVED: ${statusGroups.APPROVED.length}`);
  console.log(`  REJECTED: ${statusGroups.REJECTED.length}`);

  if (statusGroups.PENDING.length > 0) {
    console.log('\n⚠️  Existe(m) consumidor(es) PENDING. Deseja aprovar todos? Rode o script approve-yago-consumers.js');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
