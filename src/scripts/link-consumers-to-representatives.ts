import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function linkConsumersToRepresentatives() {
  try {
    console.log('🔗 Iniciando vinculação de consumidores aos representantes...');

    // Busca o primeiro representante ativo
    const representative = await prisma.representative.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (!representative) {
      console.log('❌ Nenhum representante ativo encontrado');
      return;
    }

    console.log(`✅ Representante encontrado: ${representative.name}`);

    // Busca consumidores sem representante
    const consumersWithoutRepresentative = await prisma.consumer.findMany({
      where: {
        representativeId: null,
      },
      take: 5, // Vamos vincular apenas 5 para teste
    });

    if (consumersWithoutRepresentative.length === 0) {
      console.log('❌ Nenhum consumidor sem representante encontrado');
      return;
    }

    console.log(`📊 Encontrados ${consumersWithoutRepresentative.length} consumidores para vincular`);

    // Vincula os consumidores ao representante
    const updatedConsumers = await Promise.all(
      consumersWithoutRepresentative.map(consumer =>
        prisma.consumer.update({
          where: { id: consumer.id },
          data: { representativeId: representative.id },
        })
      )
    );

    console.log(`✅ ${updatedConsumers.length} consumidores vinculados com sucesso!`);

    // Verifica o resultado
    const representativeWithConsumers = await prisma.representative.findUnique({
      where: { id: representative.id },
      include: {
        Consumer: {
          select: {
            id: true,
            name: true,
            status: true,
            averageMonthlyConsumption: true,
          },
        },
      },
    });

    console.log('\n📋 Consumidores vinculados:');
    representativeWithConsumers?.Consumer.forEach(consumer => {
      console.log(`  - ${consumer.name} (${consumer.status}) - ${consumer.averageMonthlyConsumption} kWh`);
    });

    console.log('\n🎉 Vinculação concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a vinculação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkConsumersToRepresentatives();
