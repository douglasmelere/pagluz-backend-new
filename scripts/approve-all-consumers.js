require('dotenv').config({ override: true });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔎 Buscando consumidores pendentes de aprovação (inseridos internamente)...');

  const pendingBefore = await prisma.consumer.count({
    where: {
      approvalStatus: { not: 'APPROVED' },
      submittedByRepresentativeId: null,
    },
  });

  console.log(`Encontrados ${pendingBefore} consumidores pendentes (submittedByRepresentativeId = null).`);

  if (pendingBefore === 0) {
    console.log('Nada para aprovar. Encerrando.');
    return;
  }

  const result = await prisma.consumer.updateMany({
    where: {
      approvalStatus: { not: 'APPROVED' },
      submittedByRepresentativeId: null,
    },
    data: {
      approvalStatus: 'APPROVED',
      approvedByUserId: null,
      approvedAt: new Date(),
      rejectionReason: null,
    },
  });

  console.log(`✅ Consumidores aprovados em massa: ${result.count}`);
}

main()
  .catch((err) => {
    console.error('Erro ao aprovar consumidores em massa:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

