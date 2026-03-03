
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
  try {
    const representatives = await prisma.representative.findMany({
      include: {
        _count: {
          select: { Consumer: true }
        }
      }
    });

    console.log('REPRESENTATIVES SUMMARY:');
    representatives.forEach(r => {
      console.log(`Rep ID: ${r.id}, Name: ${r.name}, Consumers: ${r._count.Consumer}`);
    });

    const allConsumers = await prisma.consumer.findMany({
      select: {
        id: true,
        status: true,
        averageMonthlyConsumption: true,
        allocatedPercentage: true,
        representativeId: true
      }
    });

    console.log('\nALL CONSUMERS (first 20):');
    allConsumers.slice(0, 20).forEach(c => {
      console.log(`ID: ${c.id}, Status: ${c.status}, Consumption: ${c.averageMonthlyConsumption}, Allocated%: ${c.allocatedPercentage}, RepID: ${c.representativeId}`);
    });

    const statusCounts = {};
    allConsumers.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });
    console.log('\nSTATUS COUNTS:', statusCounts);

  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
