
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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
  })

  if (!representative) {
    console.log('Representative not found')
    return
  }

  console.log('Representative ID:', representative.id)
  console.log('Representative Name:', representative.name)
  console.log('Total Consumers count:', representative.Consumer.length)

  const consumers = representative.Consumer
  let totalKwh = 0
  let allocatedKwh = 0
  let allocatedCount = 0

  consumers.forEach(c => {
    const kwh = Number(c.averageMonthlyConsumption) || 0
    totalKwh += kwh
    const status = String(c.status).toUpperCase()
    const isAllocatedLike = status === 'ALLOCATED' || status === 'CONVERTED'
    const hasAllocation = (Number(c.allocatedPercentage) || 0) > 0 && Boolean(c.generator?.id)

    if (isAllocatedLike && hasAllocation) {
      allocatedCount++
      allocatedKwh += (kwh * (Number(c.allocatedPercentage) || 0)) / 100
    }

    console.log(`Consumer: ${c.name} | Status: ${status} | kWh: ${kwh} | %: ${c.allocatedPercentage} | Generator: ${c.generator?.id ? 'YES' : 'NO'} | Matched: ${isAllocatedLike && hasAllocation}`)
  })

  const allocationRate = totalKwh > 0 ? (allocatedKwh / totalKwh) * 100 : 0

  console.log('\n--- Summary ---')
  console.log('Total Consumers:', consumers.length)
  console.log('Total kWh:', totalKwh)
  console.log('Allocated kWh:', allocatedKwh)
  console.log('Allocation Rate:', allocationRate)
  console.log('Allocated Consumers Count:', allocatedCount)

  if (allocationRate === 0) {
    console.log('\nDEBUG: Why is it zero?')
    if (totalKwh === 0) console.log('- Total kWh is 0')
    if (allocatedCount === 0) console.log('- No consumers matched (ALLOCATED/CONVERTED status + percentage > 0 + generator assigned)')
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
