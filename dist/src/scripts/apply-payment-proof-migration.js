"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();
async function applyMigration() {
    const client = new pg_1.Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        console.log('🔧 Conectando ao banco de dados...\n');
        await client.connect();
        console.log('✅ Conectado com sucesso!\n');
        const migrationPath = path.join(__dirname, '../../migrations/add_payment_proof_fields.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
        console.log('📄 Aplicando migração: add_payment_proof_fields.sql\n');
        console.log('SQL a ser executado:');
        console.log('─'.repeat(60));
        console.log(migrationSQL);
        console.log('─'.repeat(60));
        console.log('');
        await client.query(migrationSQL);
        console.log('✅ Migração aplicada com sucesso!\n');
        console.log('🔍 Verificando colunas criadas...\n');
        const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'commissions'
        AND column_name IN ('paymentProofUrl', 'paymentProofFileName', 'paymentProofUploadedAt')
      ORDER BY column_name;
    `);
        if (result.rows.length === 3) {
            console.log('✅ Todas as colunas foram criadas:');
            result.rows.forEach(row => {
                console.log(`   - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
            });
        }
        else {
            console.warn('⚠️  Algumas colunas podem não ter sido criadas corretamente');
            console.log('Colunas encontradas:', result.rows);
        }
        console.log('\n🎉 Processo concluído com sucesso!');
        console.log('\n📝 Próximos passos:');
        console.log('   1. Reinicie o servidor: npm run start:dev');
        console.log('   2. Teste os endpoints de comprovante de pagamento');
    }
    catch (error) {
        console.error('\n❌ Erro ao aplicar migração:', error.message);
        console.error('\n💡 Dicas:');
        console.error('   1. Verifique se a DATABASE_URL está correta no .env');
        console.error('   2. Verifique se o banco de dados está acessível');
        console.error('   3. Verifique se você tem permissões para alterar a tabela');
        process.exit(1);
    }
    finally {
        await client.end();
    }
}
applyMigration();
//# sourceMappingURL=apply-payment-proof-migration.js.map