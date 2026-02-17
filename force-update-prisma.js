const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Iniciando atualização forçada do Prisma Client...');

// Caminhos para limpar
const prismaClientPath = path.join(__dirname, 'node_modules', '@prisma', 'client');
const dotPrismaPath = path.join(__dirname, 'node_modules', '.prisma');

try {
  if (fs.existsSync(prismaClientPath)) {
    console.log('🗑️  Removendo cache antigo do Client...');
    fs.rmSync(prismaClientPath, { recursive: true, force: true });
  }
} catch (e) {
  console.warn('⚠️  Não foi possível remover @prisma/client (pode estar em uso):', e.message);
}

try {
  if (fs.existsSync(dotPrismaPath)) {
    console.log('🗑️  Removendo cache .prisma...');
    fs.rmSync(dotPrismaPath, { recursive: true, force: true });
  }
} catch (e) {
  console.warn('⚠️  Não foi possível remover .prisma (pode estar em uso):', e.message);
}

console.log('⚡ Gerando novo Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client gerado com sucesso!');
  console.log('\n👉 AGORA REINICIE SEU SERVIDOR (npm run start:dev)');
} catch (error) {
  console.error('❌ Falha ao gerar Prisma Client:', error.message);
}
