"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const enums_1 = require("../common/enums");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed de representantes...');
    const representatives = [
        {
            name: 'João Silva',
            cpfCnpj: '123.456.789-00',
            email: 'joao.silva@pagluz.com',
            password: '123456',
            phone: '(11) 99999-9999',
            city: 'São Paulo',
            state: 'SP',
            specializations: ['residencial', 'comercial'],
            status: enums_1.RepresentativeStatus.ACTIVE,
            notes: 'Representante experiente na região de São Paulo',
        },
        {
            name: 'Maria Santos',
            cpfCnpj: '987.654.321-00',
            email: 'maria.santos@pagluz.com',
            password: '123456',
            phone: '(11) 88888-8888',
            city: 'São Paulo',
            state: 'SP',
            specializations: ['industrial', 'rural'],
            status: enums_1.RepresentativeStatus.ACTIVE,
            notes: 'Especialista em clientes industriais',
        },
        {
            name: 'Carlos Oliveira',
            cpfCnpj: '456.789.123-00',
            email: 'carlos.oliveira@pagluz.com',
            password: '123456',
            phone: '(11) 77777-7777',
            city: 'São Paulo',
            state: 'SP',
            specializations: ['residencial', 'comercial', 'industrial'],
            status: enums_1.RepresentativeStatus.ACTIVE,
            notes: 'Representante sênior com ampla experiência',
        },
    ];
    for (const repData of representatives) {
        const existingRep = await prisma.representative.findUnique({
            where: { email: repData.email },
        });
        if (!existingRep) {
            const hashedPassword = await bcrypt.hash(repData.password, 10);
            const representative = await prisma.representative.create({
                data: {
                    ...repData,
                    password: hashedPassword,
                },
            });
            console.log(`✅ Representante criado: ${representative.name} (${representative.email})`);
        }
        else {
            console.log(`⏭️  Representante já existe: ${repData.name} (${repData.email})`);
        }
    }
    console.log('🎉 Seed de representantes concluído!');
}
main()
    .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-representatives.js.map