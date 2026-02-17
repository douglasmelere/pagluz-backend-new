const { Client } = require('pg');
require('dotenv').config();

async function applyMigration() {
  // Converter postgres:// para postgresql:// se necessário
  let connectionString = process.env.DATABASE_URL;
  if (connectionString && connectionString.startsWith('postgres://')) {
    connectionString = connectionString.replace('postgres://', 'postgresql://');
  }

  const client = new Client({
    connectionString: connectionString,
  });

  try {
    console.log('🔧 Conectando ao banco de dados...\n');
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');

    console.log('📄 Aplicando migração...\n');

    // SQL da migração
    const sql = `
      ALTER TABLE commissions 
      ADD COLUMN IF NOT EXISTS "paymentProofUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "paymentProofFileName" TEXT,
      ADD COLUMN IF NOT EXISTS "paymentProofUploadedAt" TIMESTAMP(3);

      CREATE INDEX IF NOT EXISTS "commissions_paymentProofUrl_idx" ON commissions("paymentProofUrl");
    `;

    await client.query(sql);

    console.log('✅ Migração aplicada com sucesso!\n');

    // Verificar colunas
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'commissions'
        AND column_name IN ('paymentProofUrl', 'paymentProofFileName', 'paymentProofUploadedAt')
      ORDER BY column_name;
    `);

    console.log('✅ Colunas criadas:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    console.log('\n🎉 Concluído! Reinicie o servidor.');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
