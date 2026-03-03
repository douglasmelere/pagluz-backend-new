import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

async function run() {
  const prisma = new PrismaClient();
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

    // Get stats for the first representative that has consumers
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
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
