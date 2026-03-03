-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Feedbacks / Suporte
-- Descrição: Cria as tabelas feedbacks e feedback_responses para o módulo de
--            reclamações, sugestões e elogios dos representantes.
-- Data: 2026-03-03
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Criar enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FeedbackType') THEN
    CREATE TYPE "FeedbackType" AS ENUM ('COMPLAINT', 'SUGGESTION', 'BUG', 'PRAISE');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FeedbackStatus') THEN
    CREATE TYPE "FeedbackStatus" AS ENUM ('OPEN', 'IN_ANALYSIS', 'RESOLVED', 'REJECTED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FeedbackPriority') THEN
    CREATE TYPE "FeedbackPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
  END IF;
END $$;

-- 2. Criar tabela feedbacks
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
);

-- 3. Criar tabela feedback_responses (thread de respostas)
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
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS "feedbacks_representativeId_idx" ON "feedbacks" ("representativeId");
CREATE INDEX IF NOT EXISTS "feedbacks_status_idx" ON "feedbacks" ("status");
CREATE INDEX IF NOT EXISTS "feedbacks_type_idx" ON "feedbacks" ("type");
CREATE INDEX IF NOT EXISTS "feedbacks_priority_idx" ON "feedbacks" ("priority");
CREATE INDEX IF NOT EXISTS "feedbacks_createdAt_idx" ON "feedbacks" ("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "feedback_responses_feedbackId_idx" ON "feedback_responses" ("feedbackId");

-- ═══════════════════════════════════════════════════════════════════════════════
-- Fim da migration
-- ═══════════════════════════════════════════════════════════════════════════════
