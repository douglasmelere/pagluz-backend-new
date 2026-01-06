"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function setupSuperAdmin() {
    try {
        console.log('🔐 Configurando SUPER_ADMIN (Douglas)...');
        const existingSuperAdmin = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' },
        });
        if (existingSuperAdmin) {
            console.log('✅ SUPER_ADMIN já existe:', existingSuperAdmin.email);
            return existingSuperAdmin;
        }
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
    }
    catch (error) {
        console.error('❌ Erro ao configurar SUPER_ADMIN:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
setupSuperAdmin();
//# sourceMappingURL=setup-super-admin.js.map