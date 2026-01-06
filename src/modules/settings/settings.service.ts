import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Obtém o valor atual do kWh
   */
  async getCurrentKwhPrice(): Promise<number> {
    const setting = await this.prisma.systemSettings.findFirst({
      where: {
        key: 'KWH_PRICE',
        isActive: true,
      },
    });

    if (!setting) {
      // Valor padrão se não estiver configurado
      return 0.90;
    }

    return parseFloat(setting.value);
  }

  /**
   * Define o valor do kWh
   */
  async setKwhPrice(price: number, userId: string): Promise<any> {
    if (price <= 0) {
      throw new BadRequestException('O preço do kWh deve ser maior que zero');
    }

    // Busca configuração existente
    const existingSetting = await this.prisma.systemSettings.findFirst({
      where: {
        key: 'KWH_PRICE',
        isActive: true,
      },
    });

    let setting;

    if (existingSetting) {
      // Atualiza configuração existente
      setting = await this.prisma.systemSettings.update({
        where: { id: existingSetting.id },
        data: {
          value: price.toString(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Cria nova configuração
      setting = await this.prisma.systemSettings.create({
        data: {
          key: 'KWH_PRICE',
          value: price.toString(),
          description: 'Preço do kWh para cálculo de comissões',
          isActive: true,
        },
      });
    }

    // Registra a atividade
    await this.auditService.log({
      userId,
      action: 'SETTINGS_UPDATE',
      entityType: 'SystemSettings',
      entityId: setting.id,
      newValues: {
        key: 'KWH_PRICE',
        value: price.toString(),
        description: 'Preço do kWh atualizado',
      },
    });

    return {
      id: setting.id,
      key: setting.key,
      value: parseFloat(setting.value),
      description: setting.description,
      updatedAt: setting.updatedAt,
    };
  }

  /**
   * Obtém histórico de alterações do preço do kWh
   */
  async getKwhPriceHistory() {
    const settings = await this.prisma.systemSettings.findMany({
      where: {
        key: 'KWH_PRICE',
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return settings.map(setting => ({
      id: setting.id,
      value: parseFloat(setting.value),
      isActive: setting.isActive,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    }));
  }

  /**
   * Obtém todas as configurações do sistema
   */
  async getAllSettings() {
    const settings = await this.prisma.systemSettings.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        key: 'asc',
      },
    });

    return settings.map(setting => ({
      id: setting.id,
      key: setting.key,
      value: setting.value,
      description: setting.description,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    }));
  }

  /**
   * Define uma configuração genérica
   */
  async setSetting(key: string, value: string, description: string, userId: string) {
    if (!key || !value) {
      throw new BadRequestException('Chave e valor são obrigatórios');
    }

    // Busca configuração existente
    const existingSetting = await this.prisma.systemSettings.findFirst({
      where: {
        key,
        isActive: true,
      },
    });

    let setting;

    if (existingSetting) {
      // Atualiza configuração existente
      setting = await this.prisma.systemSettings.update({
        where: { id: existingSetting.id },
        data: {
          value,
          description,
          updatedAt: new Date(),
        },
      });
    } else {
      // Cria nova configuração
      setting = await this.prisma.systemSettings.create({
        data: {
          key,
          value,
          description,
          isActive: true,
        },
      });
    }

    // Registra a atividade
    await this.auditService.log({
      userId,
      action: 'SETTINGS_UPDATE',
      entityType: 'SystemSettings',
      entityId: setting.id,
      newValues: {
        key,
        value,
        description,
      },
    });

    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      description: setting.description,
      updatedAt: setting.updatedAt,
    };
  }

  /**
   * Obtém estatísticas do sistema
   */
  async getSystemStats() {
    const totalConsumers = await this.prisma.consumer.count();
    const totalRepresentatives = await this.prisma.representative.count();
    const totalCommissions = await this.prisma.commission.count();
    const totalCommissionsValue = await this.prisma.commission.aggregate({
      _sum: {
        commissionValue: true,
      },
    });

    const currentKwhPrice = await this.getCurrentKwhPrice();

    return {
      totalConsumers,
      totalRepresentatives,
      totalCommissions,
      totalCommissionsValue: totalCommissionsValue._sum.commissionValue || 0,
      currentKwhPrice,
      lastUpdated: new Date(),
    };
  }
}

