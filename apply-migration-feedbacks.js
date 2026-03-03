/**
 * Script para aplicar a migration do módulo de Feedbacks/Suporte.
 * Executa o SQL diretamente no banco via Prisma.$executeRawUnsafe
 *
 * Uso: node apply-migration-feedbacks.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('  Aplicando migration: Feedbacks / Suporte');
  console.log('═══════════════════════════════════════════════════\n');

  const sqlPath = path.join(__dirname, 'MIGRATION_FEEDBACKS.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  // Separa por blocos (usando ";" como separador)
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
    try {
      await prisma.$executeRawUnsafe(stmt);
      console.log(`  ✅ [${i + 1}/${statements.length}] ${preview}...`);
    } catch (err) {
      // Ignora erros de "já existe"
      if (
        err.message?.includes('already exists') ||
        err.message?.includes('duplicate key') ||
        err.message?.includes('relation') && err.message?.includes('already exists')
      ) {
        console.log(`  ⚠️  [${i + 1}/${statements.length}] Já existe, pulando: ${preview}...`);
      } else {
        console.error(`  ❌ [${i + 1}/${statements.length}] Erro: ${err.message}`);
        console.error(`     SQL: ${preview}...`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Migration aplicada com sucesso!');
  console.log('═══════════════════════════════════════════════════');
}

main()
  .catch(e => {
    console.error('Erro fatal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
