const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://postgres:4GHcPFvWPmjiDn5z0Fd9Dj97g4PyJH7BnJyEr80yrEwWP2M3i3lx4kjflKAoizCG@147.93.71.233:5432/postgres',
    },
  },
});

async function main() {
  console.log('Criando enums...');

  try {
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FeedbackType') THEN
          CREATE TYPE "FeedbackType" AS ENUM ('COMPLAINT', 'SUGGESTION', 'BUG', 'PRAISE');
        END IF;
      END $$
    `);
    console.log('✅ Enum FeedbackType');
  } catch (e) {
    console.log('⚠️ FeedbackType:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FeedbackStatus') THEN
          CREATE TYPE "FeedbackStatus" AS ENUM ('OPEN', 'IN_ANALYSIS', 'RESOLVED', 'REJECTED');
        END IF;
      END $$
    `);
    console.log('✅ Enum FeedbackStatus');
  } catch (e) {
    console.log('⚠️ FeedbackStatus:', e.message);
  }

  try {
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FeedbackPriority') THEN
          CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
        END IF;
      END $$
    `);
    console.log('✅ Enum FeedbackPriority');
  } catch (e) {
    console.log('⚠️ FeedbackPriority:', e.message);
  }

  console.log('\nCriando tabela feedbacks...');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "feedbacks" (
        "id"                   TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "representativeId"     TEXT NOT NULL,
        "type"                 "FeedbackType" NOT NULL,
        "subject"              TEXT NOT NULL,
        "description"          TEXT NOT NULL,
        "category"             TEXT,
        "status"               "FeedbackStatus" NOT NULL DEFAULT 'OPEN',
        "priority"             "FeedbackPriority" NOT NULL DEFAULT 'MEDIUM',
        "attachmentUrl"        TEXT,
        "attachmentFileName"   TEXT,
        "resolvedAt"           TIMESTAMP(3),
        "resolvedByUserId"     TEXT,
        "createdAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "feedbacks_representativeId_fkey"
          FOREIGN KEY ("representativeId")
          REFERENCES "commercial_representatives"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    console.log('✅ Tabela feedbacks criada');
  } catch (e) {
    console.log('❌ feedbacks:', e.message);
  }

  console.log('\nCriando tabela feedback_responses...');
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "feedback_responses" (
        "id"         TEXT NOT NULL DEFAULT gen_random_uuid()::text,
        "feedbackId" TEXT NOT NULL,
        "message"    TEXT NOT NULL,
        "authorType" TEXT NOT NULL,
        "authorId"   TEXT NOT NULL,
        "authorName" TEXT NOT NULL,
        "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "feedback_responses_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "feedback_responses_feedbackId_fkey"
          FOREIGN KEY ("feedbackId")
          REFERENCES "feedbacks"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);
    console.log('✅ Tabela feedback_responses criada');
  } catch (e) {
    console.log('❌ feedback_responses:', e.message);
  }

  console.log('\nCriando índices...');
  const indexes = [
    'CREATE INDEX IF NOT EXISTS "feedbacks_representativeId_idx" ON "feedbacks" ("representativeId")',
    'CREATE INDEX IF NOT EXISTS "feedbacks_status_idx" ON "feedbacks" ("status")',
    'CREATE INDEX IF NOT EXISTS "feedbacks_type_idx" ON "feedbacks" ("type")',
    'CREATE INDEX IF NOT EXISTS "feedbacks_priority_idx" ON "feedbacks" ("priority")',
    'CREATE INDEX IF NOT EXISTS "feedbacks_createdAt_idx" ON "feedbacks" ("createdAt" DESC)',
    'CREATE INDEX IF NOT EXISTS "feedback_responses_feedbackId_idx" ON "feedback_responses" ("feedbackId")',
  ];

  for (const idx of indexes) {
    try {
      await prisma.$executeRawUnsafe(idx);
      console.log('✅ Index OK');
    } catch (e) {
      console.log('⚠️ Index:', e.message);
    }
  }

  // Verificar
  console.log('\n=== Verificação ===');
  const result = await prisma.$queryRawUnsafe(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('feedbacks', 'feedback_responses')
  `);
  console.log('Tabelas encontradas:', JSON.stringify(result));
}

main()
  .catch(e => console.error('ERRO FATAL:', e))
  .finally(() => prisma.$disconnect());
