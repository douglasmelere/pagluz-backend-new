"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const representative = await prisma.representative.findFirst({
        where: {
            name: {
                contains: 'Yago',
                mode: 'insensitive'
            }
        },
        include: {
            Consumer: {
                include: {
                    generator: true
                }
            }
        }
    });
    if (!representative) {
        console.log('Representative not found');
        return;
    }
    console.log('Representative ID:', representative.id);
    console.log('Representative Name:', representative.name);
    console.log('Total Consumers count:', representative.Consumer.length);
    const consumers = representative.Consumer;
    const totalKwh = consumers.reduce((sum, consumer) => sum + (Number(consumer.averageMonthlyConsumption) || 0), 0);
    const allocatedConsumers = consumers.filter(c => {
        const status = String(c.status).toUpperCase();
        const isAllocatedLike = status === 'ALLOCATED' || status === 'CONVERTED';
        const hasAllocation = (Number(c.allocatedPercentage) || 0) > 0 && Boolean(c.generator?.id);
        console.log(`Consumer: ${c.name} | Status: ${status} | %: ${c.allocatedPercentage} | Generator: ${c.generator?.id ? 'YES' : 'NO'} | Selected: ${isAllocatedLike && hasAllocation}`);
        return isAllocatedLike && hasAllocation;
    });
    let allocatedKwh = 0;
    allocatedConsumers.forEach(consumer => {
        allocatedKwh += ((Number(consumer.averageMonthlyConsumption) || 0) * (Number(consumer.allocatedPercentage) || 0)) / 100;
    });
    const allocationRate = totalKwh > 0 ? (allocatedKwh / totalKwh) * 100 : 0;
    console.log('--- Summary ---');
    console.log('Total kWh:', totalKwh);
    console.log('Allocated kWh:', allocatedKwh);
    console.log('Allocation Rate:', allocationRate);
    console.log('Allocated Consumers Count:', allocatedConsumers.length);
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=check_yago_allocation.js.map