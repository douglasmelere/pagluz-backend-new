-- ============================================================
-- MIGRAÇÃO: Materiais Comerciais e Comunicados
-- ============================================================
-- Execute este SQL no seu banco PostgreSQL (Supabase SQL Editor)
-- OU rode: node apply-migration-materials-announcements.js
-- ============================================================

-- 1. Enum de prioridade de comunicados
DO $$ BEGIN
  CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Tabela de Materiais Comerciais
CREATE TABLE IF NOT EXISTS "commercial_materials" (
  "id"          TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "fileUrl"     TEXT NOT NULL,
  "fileName"    TEXT NOT NULL,
  "fileType"    TEXT NOT NULL,
  "fileSize"    INTEGER,
  "category"    TEXT,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "uploadedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "commercial_materials_pkey" PRIMARY KEY ("id")
);

-- 3. Tabela de Comunicados
CREATE TABLE IF NOT EXISTS "announcements" (
  "id"               TEXT NOT NULL,
  "title"            TEXT NOT NULL,
  "message"          TEXT NOT NULL,
  "priority"         "AnnouncementPriority" NOT NULL DEFAULT 'NORMAL',
  "representativeId" TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "announcements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "announcements_representativeId_fkey"
    FOREIGN KEY ("representativeId")
    REFERENCES "commercial_representatives"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Tabela de controle de leitura de comunicados
CREATE TABLE IF NOT EXISTS "announcement_reads" (
  "id"               TEXT NOT NULL,
  "announcementId"   TEXT NOT NULL,
  "representativeId" TEXT NOT NULL,
  "readAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "announcement_reads_announcementId_representativeId_key"
    UNIQUE ("announcementId", "representativeId"),
  CONSTRAINT "announcement_reads_announcementId_fkey"
    FOREIGN KEY ("announcementId")
    REFERENCES "announcements"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "announcement_reads_representativeId_fkey"
    FOREIGN KEY ("representativeId")
    REFERENCES "commercial_representatives"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS "announcements_representativeId_idx"
  ON "announcements"("representativeId");

CREATE INDEX IF NOT EXISTS "announcements_priority_idx"
  ON "announcements"("priority");

CREATE INDEX IF NOT EXISTS "announcement_reads_representativeId_idx"
  ON "announcement_reads"("representativeId");

CREATE INDEX IF NOT EXISTS "commercial_materials_isActive_idx"
  ON "commercial_materials"("isActive");

-- 6. Verificação
SELECT 'commercial_materials' AS tabela, COUNT(*) AS registros FROM commercial_materials
UNION ALL
SELECT 'announcements', COUNT(*) FROM announcements
UNION ALL
SELECT 'announcement_reads', COUNT(*) FROM announcement_reads;
