"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function linkConsumersToRepresentatives() {
    try {
        console.log('🔗 Iniciando vinculação de consumidores aos representantes...');
        const representative = await prisma.representative.findFirst({
            where: { status: 'ACTIVE' },
        });
        if (!representative) {
            console.log('❌ Nenhum representante ativo encontrado');
            return;
        }
        console.log(`✅ Representante encontrado: ${representative.name}`);
        const consumersWithoutRepresentative = await prisma.consumer.findMany({
            where: {
                representativeId: null,
            },
            take: 5,
        });
        if (consumersWithoutRepresentative.length === 0) {
            console.log('❌ Nenhum consumidor sem representante encontrado');
            return;
        }
        console.log(`📊 Encontrados ${consumersWithoutRepresentative.length} consumidores para vincular`);
        const updatedConsumers = await Promise.all(consumersWithoutRepresentative.map(consumer => prisma.consumer.update({
            where: { id: consumer.id },
            data: { representativeId: representative.id },
        })));
        console.log(`✅ ${updatedConsumers.length} consumidores vinculados com sucesso!`);
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
    }
    catch (error) {
        console.error('❌ Erro durante a vinculação:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
linkConsumersToRepresentatives();
//# sourceMappingURL=link-consumers-to-representatives.js.map