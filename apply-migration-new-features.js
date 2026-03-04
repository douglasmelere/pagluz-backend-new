const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function run(label, sql) {
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log(`✅ ${label}`);
  } catch (e) {
    console.log(`⚠️ ${label}: ${e.message.substring(0, 100)}`);
  }
}

async function main() {
  console.log('🚀 Aplicando migration de novas features...\n');

  // Enums
  await run('GoalType', `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GoalType') THEN CREATE TYPE "GoalType" AS ENUM ('CLIENTS', 'KWH', 'REVENUE', 'COMMISSION'); END IF; END $$`);
  await run('GoalStatus', `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GoalStatus') THEN CREATE TYPE "GoalStatus" AS ENUM ('IN_PROGRESS', 'ACHIEVED', 'FAILED', 'CANCELLED'); END IF; END $$`);

  // Push Tokens
  await run('push_tokens table', `
    CREATE TABLE IF NOT EXISTS "push_tokens" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "representativeId" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "platform" TEXT NOT NULL,
      "deviceName" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "push_tokens_token_key" UNIQUE ("token"),
      CONSTRAINT "push_tokens_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "commercial_representatives"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await run('push_tokens_representativeId_idx', `CREATE INDEX IF NOT EXISTS "push_tokens_representativeId_idx" ON "push_tokens" ("representativeId")`);

  // Activity Logs
  await run('activity_logs table', `
    CREATE TABLE IF NOT EXISTS "activity_logs" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "representativeId" TEXT,
      "entityType" TEXT NOT NULL,
      "entityId" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "details" JSONB,
      "performedBy" TEXT,
      "performedByName" TEXT,
      "performedByRole" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "activity_logs_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "commercial_representatives"("id") ON DELETE SET NULL ON UPDATE CASCADE
    )
  `);
  await run('activity_logs_entityType_entityId_idx', `CREATE INDEX IF NOT EXISTS "activity_logs_entityType_entityId_idx" ON "activity_logs" ("entityType", "entityId")`);
  await run('activity_logs_representativeId_idx', `CREATE INDEX IF NOT EXISTS "activity_logs_representativeId_idx" ON "activity_logs" ("representativeId")`);
  await run('activity_logs_createdAt_idx', `CREATE INDEX IF NOT EXISTS "activity_logs_createdAt_idx" ON "activity_logs" ("createdAt" DESC)`);

  // Representative Goals
  await run('representative_goals table', `
    CREATE TABLE IF NOT EXISTS "representative_goals" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "representativeId" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "type" "GoalType" NOT NULL,
      "targetValue" DOUBLE PRECISION NOT NULL,
      "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "unit" TEXT NOT NULL,
      "periodStart" TIMESTAMP(3) NOT NULL,
      "periodEnd" TIMESTAMP(3) NOT NULL,
      "status" "GoalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
      "createdByUserId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "representative_goals_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "representative_goals_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "commercial_representatives"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await run('representative_goals_representativeId_idx', `CREATE INDEX IF NOT EXISTS "representative_goals_representativeId_idx" ON "representative_goals" ("representativeId")`);

  // Representative Badges
  await run('representative_badges table', `
    CREATE TABLE IF NOT EXISTS "representative_badges" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "representativeId" TEXT NOT NULL,
      "badgeKey" TEXT NOT NULL,
      "badgeName" TEXT NOT NULL,
      "badgeDescription" TEXT NOT NULL,
      "badgeIcon" TEXT NOT NULL,
      "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "representative_badges_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "representative_badges_representativeId_badgeKey_key" UNIQUE ("representativeId", "badgeKey"),
      CONSTRAINT "representative_badges_representativeId_fkey" FOREIGN KEY ("representativeId") REFERENCES "commercial_representatives"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await run('representative_badges_representativeId_idx', `CREATE INDEX IF NOT EXISTS "representative_badges_representativeId_idx" ON "representative_badges" ("representativeId")`);

  // KWH Price History
  await run('kwh_price_history table', `
    CREATE TABLE IF NOT EXISTS "kwh_price_history" (
      "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
      "concessionaire" TEXT NOT NULL,
      "pricePerKwh" DOUBLE PRECISION NOT NULL,
      "effectiveFrom" TIMESTAMP(3) NOT NULL,
      "effectiveUntil" TIMESTAMP(3),
      "source" TEXT,
      "notes" TEXT,
      "createdByUserId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "kwh_price_history_pkey" PRIMARY KEY ("id")
    )
  `);
  await run('kwh_price_history_idx', `CREATE INDEX IF NOT EXISTS "kwh_price_history_concessionaire_effectiveFrom_idx" ON "kwh_price_history" ("concessionaire", "effectiveFrom")`);

  // Verificação
  console.log('\n=== Verificação ===');
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('push_tokens', 'activity_logs', 'representative_goals', 'representative_badges', 'kwh_price_history')
    ORDER BY table_name
  `);
  console.log('Tabelas:', tables.map(t => t.table_name).join(', '));
  console.log(`\n🎉 Migration concluída!`);
}

main()
  .catch(e => console.error('ERRO FATAL:', e))
  .finally(() => prisma.$disconnect());
