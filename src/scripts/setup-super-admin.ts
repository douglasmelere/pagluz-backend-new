import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupSuperAdmin() {
  try {
    console.log('🔐 Configurando SUPER_ADMIN (Douglas)...');

    // Verifica se já existe um SUPER_ADMIN
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (existingSuperAdmin) {
      console.log('✅ SUPER_ADMIN já existe:', existingSuperAdmin.email);
      return existingSuperAdmin;
    }

    // Cria o SUPER_ADMIN (Douglas)
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'douglas@pagluz.com',
        password: hashedPassword,
        name: 'Douglas Melere',
        role: 'SUPER_ADMIN',
        isActive: true,
        passwordChangedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('🎉 SUPER_ADMIN criado com sucesso!');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Senha: admin123');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

    return superAdmin;

  } catch (error) {
    console.error('❌ Erro ao configurar SUPER_ADMIN:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupSuperAdmin();
