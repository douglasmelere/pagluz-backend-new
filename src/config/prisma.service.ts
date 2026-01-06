// Carrega o .env antes de importar o PrismaClient
import { config } from 'dotenv';
import { resolve } from 'path';

// Carrega o .env do diretório raiz do projeto
// override: true garante que o .env sobrescreva variáveis de ambiente existentes
config({ path: resolve(process.cwd(), '.env'), override: true });

import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // Garante que a DATABASE_URL está definida
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl || (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://'))) {
      throw new Error(
        `DATABASE_URL inválida ou não encontrada. Valor atual: ${databaseUrl || 'undefined'}. ` +
        `Certifique-se de que o arquivo .env existe e contém DATABASE_URL=postgresql://...`
      );
    }
    
    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}

