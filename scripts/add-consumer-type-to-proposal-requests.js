require('dotenv').config({ override: true });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔎 Verificando coluna "consumerType" em "proposal_requests"...');

  const checkColumnSql = `
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'proposal_requests'
      AND column_name = 'consumerType'
    LIMIT 1;
  `;

  const existing = await prisma.$queryRawUnsafe(checkColumnSql);

  if (existing && existing.length > 0) {
    console.log('✅ Coluna "consumerType" já existe em "proposal_requests". Nada a fazer.');
    return;
  }

  console.log('⚙️  Adicionando coluna "consumerType" em "proposal_requests"...');

  const alterSql = `
    ALTER TABLE "proposal_requests"
    ADD COLUMN "consumerType" "ConsumerType" NOT NULL DEFAULT 'RESIDENTIAL';
  `;

  await prisma.$executeRawUnsafe(alterSql);

  console.log('✅ Coluna "consumerType" adicionada com sucesso em "proposal_requests".');
}

main()
  .catch((err) => {
    console.error('❌ Erro ao ajustar tabela "proposal_requests":', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

