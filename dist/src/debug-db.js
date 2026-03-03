"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = require("dotenv");
const path_1 = require("path");
dotenv.config({ path: (0, path_1.resolve)(__dirname, '../.env') });
async function run() {
    const prisma = new client_1.PrismaClient();
    try {
        const counts = await prisma.consumer.groupBy({
            by: ['status'],
            _count: { id: true },
            _sum: { averageMonthlyConsumption: true }
        });
        console.log('--- GLOBAL CONSUMER STATS ---');
        console.log(JSON.stringify(counts, null, 2));
        const reps = await prisma.representative.findMany({
            take: 10,
            select: {
                id: true,
                name: true,
                email: true,
                _count: {
                    select: { Consumer: true }
                }
            }
        });
        console.log('--- REPRESENTATIVES ---');
        console.log(JSON.stringify(reps, null, 2));
        const repWithConsumers = reps.find(r => r._count.Consumer > 0);
        if (repWithConsumers) {
            const consumers = await prisma.consumer.findMany({
                where: { representativeId: repWithConsumers.id }
            });
            console.log(`--- CONSUMERS FOR REP ${repWithConsumers.name} ---`);
            console.log(JSON.stringify(consumers.map(c => ({
                id: c.id,
                status: c.status,
                kwh: c.averageMonthlyConsumption,
                perc: c.allocatedPercentage
            })), null, 2));
        }
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await prisma.$disconnect();
    }
}
run();
//# sourceMappingURL=debug-db.js.map