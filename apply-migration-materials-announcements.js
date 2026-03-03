const { Client } = require('pg');
require('dotenv').config();

async function applyMigration() {
  let connectionString = process.env.DATABASE_URL;
  if (connectionString && connectionString.startsWith('postgres://')) {
    connectionString = connectionString.replace('postgres://', 'postgresql://');
  }

  if (!connectionString) {
    console.error('❌ DATABASE_URL não encontrado no .env');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    console.log('🔧 Conectando ao banco de dados...\n');
    await client.connect();
    console.log('✅ Conectado!\n');

    console.log('📄 Criando enum AnnouncementPriority...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    console.log('✅ Enum criado (ou já existia).\n');

    console.log('📄 Criando tabela commercial_materials...');
    await client.query(`
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
    `);
    console.log('✅ Tabela commercial_materials criada.\n');

    console.log('📄 Criando tabela announcements...');
    await client.query(`
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
    `);
    console.log('✅ Tabela announcements criada.\n');

    console.log('📄 Criando tabela announcement_reads...');
    await client.query(`
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
    `);
    console.log('✅ Tabela announcement_reads criada.\n');

    console.log('📄 Criando índices...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS "announcements_representativeId_idx" ON "announcements"("representativeId");
      CREATE INDEX IF NOT EXISTS "announcements_priority_idx" ON "announcements"("priority");
      CREATE INDEX IF NOT EXISTS "announcement_reads_representativeId_idx" ON "announcement_reads"("representativeId");
      CREATE INDEX IF NOT EXISTS "commercial_materials_isActive_idx" ON "commercial_materials"("isActive");
    `);
    console.log('✅ Índices criados.\n');

    // Verificação final
    const result = await client.query(`
      SELECT 'commercial_materials' AS tabela, COUNT(*)::int AS registros FROM commercial_materials
      UNION ALL SELECT 'announcements', COUNT(*)::int FROM announcements
      UNION ALL SELECT 'announcement_reads', COUNT(*)::int FROM announcement_reads;
    `);
    console.log('📊 Tabelas verificadas:');
    result.rows.forEach(row => console.log(`   ✅ ${row.tabela} (${row.registros} registros)`));

    console.log('\n🎉 Migração concluída! Reinicie o servidor com: npm run start:dev\n');
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
