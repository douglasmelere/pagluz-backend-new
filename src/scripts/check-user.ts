import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários existentes...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no sistema.');
      return;
    }

    console.log(`📊 Total de usuários: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'Sem nome'} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Papel: ${user.role}`);
      console.log(`   Ativo: ${user.isActive ? '✅ Sim' : '❌ Não'}`);
      console.log(`   Criado em: ${user.createdAt.toLocaleDateString('pt-BR')}`);
      console.log('');
    });

    // Verifica hierarquia
    console.log('🏗️  Hierarquia de papéis:');
    console.log('SUPER_ADMIN (4) > ADMIN (3) > MANAGER (2) > OPERATOR (1) > REPRESENTATIVE (0)');
    
    const hierarchy = {
      'SUPER_ADMIN': 4,
      'ADMIN': 3,
      'MANAGER': 2,
      'OPERATOR': 1,
      'REPRESENTATIVE': 0,
    };

    console.log('\n📋 Resumo por papel:');
    Object.entries(hierarchy).forEach(([role, level]) => {
      const count = users.filter(u => u.role === role).length;
      const activeCount = users.filter(u => u.role === role && u.isActive).length;
      console.log(`${role} (${level}): ${count} usuários, ${activeCount} ativos`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
