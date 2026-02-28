require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Lista de consumidores a associar ao Yago
const consumerNames = [
  'Ilson Slongo Corrêa',
  'Joilson Pelantir de Oliveira',
  'Sergio Antonio Stechinski',
  'Danuza Salete Dalla Costa',
  'EXCELSA FARMACIA DE MANIPULACAO',
  'NADIR SCHIMIDT THOME',
  'ARCTURO ATIVIDADE MARITIMAS',
  'ANDRE ANDERSON POTT',
  'MERCADO FORNARI LTDA',
  'ITAMAR FRANCISCO FORNARI',
  'JANETE BONISONI',
  'DESTAQUE CORTINAS E DECORAÇÕES',
  'PATRICIA ANDRESSA SGANDERLA',
  'Antônio Vinicius Fornari',
  'SUPERMERCADO JULIO LTDA',
  'Wilian Risso',
  'Deonilse moriggi',
  'RESTAURANTE E LANCHONETE FORMIGHIERI LTDA',
  'MEGA LOTERIAS LTDA ME',
  'LAUDEMIR REINALDO JUNG',
  'EDUARDO PEGORINI',
  'TAISA FERNANDA HASSEMER',
  'PADEL PLACE LTDA',
  'FEEDBACK CENTRO DE ATIVIDADE',
  'ULTRA ADVENTURE LTDA',
  'ESFIHARIA PODEROSA CHEFINHA',
  'VANDERLEI LEONIR JUNG',
  'CEMILTO ADOLINO JUNG',
  'LABORATORIO ANALIC LTDA',
];

async function main() {
  console.log('=== Associando consumidores ao representante Yago ===\n');

  // 1. Buscar o representante Yago
  const yago = await prisma.representative.findFirst({
    where: {
      name: {
        contains: 'Yago',
        mode: 'insensitive',
      },
    },
  });

  if (!yago) {
    console.error('❌ Representante "Yago" não encontrado no banco!');
    process.exit(1);
  }

  console.log(`✅ Representante encontrado: ${yago.name} (ID: ${yago.id})\n`);

  // 2. Para cada nome da lista, buscar o consumidor e associar
  let associados = 0;
  let naoEncontrados = [];
  let jaAssociados = [];

  for (const name of consumerNames) {
    const consumers = await prisma.consumer.findMany({
      where: {
        name: {
          contains: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (consumers.length === 0) {
      // Tentar busca mais flexível (apenas parte do nome)
      const parts = name.trim().split(' ');
      const flexConsumers = await prisma.consumer.findMany({
        where: {
          name: {
            contains: parts[0],
            mode: 'insensitive',
          },
        },
      });

      if (flexConsumers.length === 0) {
        console.log(`⚠️  Não encontrado: "${name}"`);
        naoEncontrados.push(name);
      } else {
        console.log(`⚠️  Busca exata não encontrou "${name}", mas encontrou variações:`);
        for (const c of flexConsumers) {
          console.log(`   - ${c.name} (ID: ${c.id}, representativeId: ${c.representativeId})`);
        }
        naoEncontrados.push(name);
      }
    } else {
      for (const consumer of consumers) {
        if (consumer.representativeId === yago.id) {
          console.log(`ℹ️  Já associado: "${consumer.name}" (ID: ${consumer.id})`);
          jaAssociados.push(consumer.name);
        } else {
          await prisma.consumer.update({
            where: { id: consumer.id },
            data: { representativeId: yago.id },
          });
          console.log(`✅ Associado: "${consumer.name}" (ID: ${consumer.id})`);
          associados++;
        }
      }
    }
  }

  console.log('\n=== RESUMO ===');
  console.log(`✅ Consumidores associados com sucesso: ${associados}`);
  console.log(`ℹ️  Já estavam associados ao Yago: ${jaAssociados.length}`);
  console.log(`⚠️  Não encontrados no banco: ${naoEncontrados.length}`);
  if (naoEncontrados.length > 0) {
    console.log('\nNomes não encontrados:');
    naoEncontrados.forEach(n => console.log(`  - ${n}`));
  }
}

main()
  .catch((e) => {
    console.error('Erro fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
