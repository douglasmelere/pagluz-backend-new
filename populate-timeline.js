const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  console.log('🚀 Populando timeline com dados históricos...\n');

  let total = 0;

  // 1. Consumidores
  console.log('📋 Consumidores...');
  const consumers = await prisma.consumer.findMany({
    include: {
      Representative: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  for (const c of consumers) {
    await prisma.activityLog.create({
      data: {
        entityType: 'Consumer',
        entityId: c.id,
        action: 'CREATED',
        description: `Consumidor "${c.name}" cadastrado (UC: ${c.ucNumber})`,
        representativeId: c.representativeId || null,
        performedBy: c.representativeId || null,
        performedByName: c.Representative?.name || 'Sistema',
        performedByRole: c.representativeId ? 'REPRESENTATIVE' : 'SYSTEM',
        createdAt: c.createdAt,
      },
    });
    total++;

    // Status changes
    if (c.status !== 'AVAILABLE') {
      const statusLabels = {
        ALLOCATED: 'Alocado',
        IN_PROCESS: 'Em Processo',
        CONVERTED: 'Convertido',
      };
      await prisma.activityLog.create({
        data: {
          entityType: 'Consumer',
          entityId: c.id,
          action: 'STATUS_CHANGED',
          description: `Consumidor "${c.name}" mudou status para ${statusLabels[c.status] || c.status}`,
          representativeId: c.representativeId || null,
          performedByRole: 'SYSTEM',
          createdAt: c.updatedAt,
        },
      });
      total++;
    }
  }
  console.log(`  ✅ ${consumers.length} consumidores processados`);

  // 2. Comissões
  console.log('💰 Comissões...');
  const commissions = await prisma.commission.findMany({
    include: {
      representative: { select: { id: true, name: true } },
      consumer: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  for (const c of commissions) {
    await prisma.activityLog.create({
      data: {
        entityType: 'Commission',
        entityId: c.id,
        action: 'CREATED',
        description: `Comissão de R$ ${c.commissionValue.toFixed(2)} gerada para "${c.representative.name}" (cliente: ${c.consumer.name})`,
        representativeId: c.representativeId,
        performedByRole: 'SYSTEM',
        createdAt: c.calculatedAt,
      },
    });
    total++;

    if (c.status === 'PAID' && c.paidAt) {
      await prisma.activityLog.create({
        data: {
          entityType: 'Commission',
          entityId: c.id,
          action: 'STATUS_CHANGED',
          description: `Comissão de R$ ${c.commissionValue.toFixed(2)} marcada como PAGA para "${c.representative.name}"`,
          representativeId: c.representativeId,
          performedByRole: 'ADMIN',
          createdAt: c.paidAt,
        },
      });
      total++;
    }
  }
  console.log(`  ✅ ${commissions.length} comissões processadas`);

  // 3. Geradores
  console.log('⚡ Geradores...');
  const generators = await prisma.generator.findMany({
    orderBy: { createdAt: 'asc' },
  });

  for (const g of generators) {
    await prisma.activityLog.create({
      data: {
        entityType: 'Generator',
        entityId: g.id,
        action: 'CREATED',
        description: `Gerador "${g.ownerName}" cadastrado (UC: ${g.ucNumber}, ${g.installedPower} kWp)`,
        performedByRole: 'ADMIN',
        createdAt: g.createdAt,
      },
    });
    total++;
  }
  console.log(`  ✅ ${generators.length} geradores processados`);

  // 4. Representantes
  console.log('👤 Representantes...');
  const representatives = await prisma.representative.findMany({
    orderBy: { createdAt: 'asc' },
  });

  for (const r of representatives) {
    await prisma.activityLog.create({
      data: {
        entityType: 'Representative',
        entityId: r.id,
        action: 'CREATED',
        description: `Representante "${r.name}" cadastrado`,
        representativeId: r.id,
        performedByRole: 'SYSTEM',
        createdAt: r.createdAt,
      },
    });
    total++;

    if (r.status === 'ACTIVE') {
      await prisma.activityLog.create({
        data: {
          entityType: 'Representative',
          entityId: r.id,
          action: 'STATUS_CHANGED',
          description: `Representante "${r.name}" foi ativado`,
          representativeId: r.id,
          performedByRole: 'ADMIN',
          createdAt: r.updatedAt,
        },
      });
      total++;
    }
  }
  console.log(`  ✅ ${representatives.length} representantes processados`);

  // 5. Propostas
  console.log('📋 Propostas...');
  try {
    const proposals = await prisma.proposalRequest.findMany({
      include: { representative: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    for (const p of proposals) {
      await prisma.activityLog.create({
        data: {
          entityType: 'ProposalRequest',
          entityId: p.id,
          action: 'CREATED',
          description: `Proposta de ${p.type} solicitada por "${p.representative.name}"`,
          representativeId: p.representativeId,
          performedBy: p.representativeId,
          performedByName: p.representative.name,
          performedByRole: 'REPRESENTATIVE',
          createdAt: p.createdAt,
        },
      });
      total++;
    }
    console.log(`  ✅ ${proposals.length} propostas processadas`);
  } catch (e) {
    console.log(`  ⚠️ Propostas: ${e.message.substring(0, 60)}`);
  }

  // 6. Feedbacks
  console.log('💬 Feedbacks...');
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: { representative: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    for (const f of feedbacks) {
      await prisma.activityLog.create({
        data: {
          entityType: 'Feedback',
          entityId: f.id,
          action: 'CREATED',
          description: `Feedback "${f.title}" criado por "${f.representative.name}" (${f.type})`,
          representativeId: f.representativeId,
          performedBy: f.representativeId,
          performedByName: f.representative.name,
          performedByRole: 'REPRESENTATIVE',
          createdAt: f.createdAt,
        },
      });
      total++;
    }
    console.log(`  ✅ ${feedbacks.length} feedbacks processados`);
  } catch (e) {
    console.log(`  ⚠️ Feedbacks: ${e.message.substring(0, 60)}`);
  }

  console.log(`\n🎉 Timeline populada! Total de ${total} registros de atividade criados.`);
}

main()
  .catch(e => console.error('ERRO:', e))
  .finally(() => prisma.$disconnect());
