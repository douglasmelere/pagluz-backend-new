const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

/**
 * Calcula comissão sem o limite mínimo de 600 kWh.
 * Para consumo < 600 kWh aplica 30% (mesma alíquota da faixa inferior).
 */
function calculateCommission(kwhConsumption, kwhPrice) {
  const invoiceValue = kwhConsumption * kwhPrice;

  let commissionPercentage;
  if (kwhConsumption >= 1500) {
    commissionPercentage = 0.375; // 37.50%
  } else if (kwhConsumption >= 1000) {
    commissionPercentage = 0.35;  // 35%
  } else if (kwhConsumption >= 600) {
    commissionPercentage = 0.30;  // 30%
  } else {
    commissionPercentage = 0.30;  // 30% — faixa mínima, sem bloqueio por consumo
  }

  return Math.round(invoiceValue * commissionPercentage * 100) / 100;
}

async function main() {
  console.log('=== Gerando comissões para todos os consumidores do Yago ===\n');

  // Busca preço do kWh nas configurações do sistema
  const kwhSetting = await prisma.systemSettings.findFirst({
    where: { key: { contains: 'kwh', mode: 'insensitive' }, isActive: true },
  });

  if (!kwhSetting) {
    console.error('❌ Preço do kWh não encontrado nas configurações!');
    // Lista todas as configurações para debug
    const allSettings = await prisma.systemSettings.findMany();
    console.log('Configurações disponíveis:', allSettings.map(s => `${s.key} = ${s.value}`));
    process.exit(1);
  }

  const kwhPrice = parseFloat(kwhSetting.value);
  console.log(`💡 Preço do kWh: R$ ${kwhPrice} (chave: ${kwhSetting.key})\n`);

  // Busca o Yago
  const yago = await prisma.representative.findFirst({
    where: { name: { contains: 'Yago', mode: 'insensitive' } },
  });

  if (!yago) {
    console.error('❌ Yago não encontrado!');
    process.exit(1);
  }

  console.log(`✅ Representante: ${yago.name} (ID: ${yago.id})\n`);

  // Busca todos os consumidores do Yago sem comissão
  const consumers = await prisma.consumer.findMany({
    where: {
      representativeId: yago.id,
      approvalStatus: 'APPROVED',
      commissions: { none: {} },
    },
    select: {
      id: true,
      name: true,
      averageMonthlyConsumption: true,
      representativeId: true,
    },
    orderBy: { averageMonthlyConsumption: 'desc' },
  });

  console.log(`📋 Consumidores aprovados sem comissão: ${consumers.length}\n`);

  if (consumers.length === 0) {
    console.log('ℹ️  Nenhum consumidor elegível encontrado (todos podem já ter comissão).');
    return;
  }

  let criadas = 0;
  let erros = 0;

  for (const consumer of consumers) {
    const commissionValue = calculateCommission(consumer.averageMonthlyConsumption, kwhPrice);
    const below600 = consumer.averageMonthlyConsumption < 600;

    try {
      await prisma.commission.create({
        data: {
          representativeId: yago.id,
          consumerId: consumer.id,
          kwhConsumption: consumer.averageMonthlyConsumption,
          kwhPrice,
          commissionValue,
          status: 'CALCULATED',
          calculatedAt: new Date(),
        },
      });

      console.log(
        `✅ ${consumer.name} — ${consumer.averageMonthlyConsumption} kWh → R$ ${commissionValue}${below600 ? ' (< 600 kWh, alíquota 30%)' : ''}`
      );
      criadas++;
    } catch (err) {
      console.error(`❌ Erro ao criar comissão para ${consumer.name}: ${err.message}`);
      erros++;
    }
  }

  console.log('\n=== RESUMO ===');
  console.log(`✅ Comissões criadas: ${criadas}`);
  if (erros > 0) console.log(`❌ Erros: ${erros}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
