import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CommissionStatus } from '../../common/enums';
import { AuditService } from '../../common/services/audit.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class CommissionsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private settingsService: SettingsService,
  ) { }

  /**
   * Calcula a comissão usando tabela progressiva baseada no consumo
   * @param kwhConsumption - Consumo em kWh (K)
   * @param kwhPrice - Preço do kWh (P)
   * @returns Valor da comissão calculada
   * 
   * Tabela de comissionamento:
   * - Consumo 600 kW/h - 1000 kW/h: 30%
   * - Consumo 1000 kW/h - 1500 kW/h: 35%
   * - Consumo >= 1500 kW/h: 37.50%
   */
  calculateCommission(kwhConsumption: number, kwhPrice: number): number {
    // Calcula o valor base da fatura
    const invoiceValue = kwhConsumption * kwhPrice;

    // Define a porcentagem de comissão baseada no consumo
    let commissionPercentage = 0;

    if (kwhConsumption >= 1500) {
      commissionPercentage = 0.375; // 37.50%
    } else if (kwhConsumption >= 1000) {
      commissionPercentage = 0.35; // 35%
    } else if (kwhConsumption >= 600) {
      commissionPercentage = 0.30; // 30%
    } else {
      // Consumo abaixo de 600 kW/h não gera comissão
      commissionPercentage = 0;
    }

    const commission = invoiceValue * commissionPercentage;
    return Math.round(commission * 100) / 100; // Arredonda para 2 casas decimais
  }

  /**
   * Cria uma nova comissão quando um consumidor é aprovado
   * @param consumerId - ID do consumidor aprovado
   */
  async createCommissionForApprovedConsumer(consumerId: string) {
    // Obtém o preço atual do kWh das configurações
    const kwhPrice = await this.settingsService.getCurrentKwhPrice();
    // Busca o consumidor com seus dados
    const consumer = await this.prisma.consumer.findUnique({
      where: { id: consumerId },
      include: {
        Representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!consumer) {
      throw new NotFoundException('Consumidor não encontrado');
    }

    if (!consumer.representativeId) {
      throw new BadRequestException('Consumidor não possui representante vinculado');
    }

    if (consumer.approvalStatus !== 'APPROVED') {
      throw new BadRequestException('Consumidor não está aprovado');
    }

    // Verifica se já existe uma comissão para este consumidor
    const existingCommission = await this.prisma.commission.findFirst({
      where: {
        consumerId: consumer.id,
        representativeId: consumer.representativeId,
      },
    });

    if (existingCommission) {
      throw new BadRequestException('Comissão já existe para este consumidor');
    }

    // Calcula a comissão
    const commissionValue = this.calculateCommission(
      consumer.averageMonthlyConsumption,
      kwhPrice
    );

    // Cria a comissão
    const commission = await this.prisma.commission.create({
      data: {
        representativeId: consumer.representativeId,
        consumerId: consumer.id,
        kwhConsumption: consumer.averageMonthlyConsumption,
        kwhPrice,
        commissionValue,
        status: CommissionStatus.CALCULATED,
        calculatedAt: new Date(),
      },
      include: {
        representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
            averageMonthlyConsumption: true,
          },
        },
      },
    });

    // Registra a atividade
    await this.auditService.log({
      action: 'COMMISSION_CREATED',
      entityType: 'Commission',
      entityId: commission.id,
      newValues: {
        representativeId: commission.representativeId,
        consumerId: commission.consumerId,
        commissionValue: commission.commissionValue,
        kwhConsumption: commission.kwhConsumption,
        kwhPrice: commission.kwhPrice,
      },
    });

    return commission;
  }

  /**
   * Busca todas as comissões de um representante
   * @param representativeId - ID do representante
   */
  async getRepresentativeCommissions(representativeId: string) {
    const commissions = await this.prisma.commission.findMany({
      where: { representativeId },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
            averageMonthlyConsumption: true,
            city: true,
            state: true,
            approvalStatus: true,
            approvedAt: true,
          },
        },
      },
      orderBy: {
        calculatedAt: 'desc',
      },
    });

    return commissions;
  }

  /**
   * Busca estatísticas de comissões de um representante
   * @param representativeId - ID do representante
   */
  async getRepresentativeCommissionStats(representativeId: string) {
    const commissions = await this.prisma.commission.findMany({
      where: { representativeId },
      select: {
        commissionValue: true,
        status: true,
        calculatedAt: true,
        paidAt: true,
        consumer: {
          select: {
            name: true,
            averageMonthlyConsumption: true,
          },
        },
      },
    });

    const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionValue, 0);
    const paidCommissions = commissions
      .filter(c => c.status === 'PAID')
      .reduce((sum, c) => sum + c.commissionValue, 0);
    const pendingCommissions = commissions
      .filter(c => c.status === 'CALCULATED')
      .reduce((sum, c) => sum + c.commissionValue, 0);

    // Agrupa por status
    const statusBreakdown = commissions.reduce((acc, c) => {
      acc[c.status.toLowerCase()] = (acc[c.status.toLowerCase()] || 0) + 1;
      return acc;
    }, {});

    // Comissões por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyCommissions: Array<{ month: string, count: number, value: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthCommissions = commissions.filter(c => {
        const commissionDate = new Date(c.calculatedAt);
        return commissionDate >= monthStart && commissionDate <= monthEnd;
      });

      monthlyCommissions.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        count: monthCommissions.length,
        value: monthCommissions.reduce((sum, c) => sum + c.commissionValue, 0),
      });
    }

    return {
      totalCommissions: Math.round(totalCommissions * 100) / 100,
      paidCommissions: Math.round(paidCommissions * 100) / 100,
      pendingCommissions: Math.round(pendingCommissions * 100) / 100,
      totalConsumers: commissions.length,
      statusBreakdown,
      monthlyCommissions,
    };
  }

  /**
   * Busca todas as comissões (para administradores)
   */
  async getAllCommissions() {
    const commissions = await this.prisma.commission.findMany({
      include: {
        representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
            averageMonthlyConsumption: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: {
        calculatedAt: 'desc',
      },
    });

    return commissions;
  }

  /**
   * Busca comissões pendentes (para administradores)
   */
  async getPendingCommissions() {
    const commissions = await this.prisma.commission.findMany({
      where: { status: CommissionStatus.CALCULATED },
      include: {
        representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
            averageMonthlyConsumption: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: {
        calculatedAt: 'desc',
      },
    });

    return commissions;
  }

  /**
   * Marca uma comissão como paga
   * @param commissionId - ID da comissão
   * @param userId - ID do usuário que está marcando como paga
   */
  async markCommissionAsPaid(commissionId: string, userId: string) {
    const commission = await this.prisma.commission.findUnique({
      where: { id: commissionId },
      include: {
        representative: true,
        consumer: true,
      },
    });

    if (!commission) {
      throw new NotFoundException('Comissão não encontrada');
    }

    if (commission.status === 'PAID') {
      throw new BadRequestException('Comissão já foi marcada como paga');
    }

    const updatedCommission = await this.prisma.commission.update({
      where: { id: commissionId },
      data: {
        status: CommissionStatus.PAID,
        paidAt: new Date(),
      },
      include: {
        representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
          },
        },
      },
    });

    // Registra a atividade
    await this.auditService.log({
      userId,
      action: 'COMMISSION_PAID',
      entityType: 'Commission',
      entityId: commissionId,
      oldValues: commission,
      newValues: updatedCommission,
    });

    return updatedCommission;
  }

  /**
   * Busca comissões por período
   * @param representativeId - ID do representante
   * @param startDate - Data inicial
   * @param endDate - Data final
   */
  async getCommissionsByPeriod(
    representativeId: string,
    startDate: string,
    endDate: string
  ) {
    const commissions = await this.prisma.commission.findMany({
      where: {
        representativeId,
        calculatedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
            averageMonthlyConsumption: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: {
        calculatedAt: 'desc',
      },
    });

    return commissions;
  }

  /**
   * Busca detalhes de uma comissão específica
   * @param commissionId - ID da comissão
   */
  async getCommissionDetails(commissionId: string) {
    const commission = await this.prisma.commission.findUnique({
      where: { id: commissionId },
      include: {
        representative: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
            averageMonthlyConsumption: true,
            city: true,
            state: true,
            approvalStatus: true,
            approvedAt: true,
          },
        },
      },
    });

    if (!commission) {
      throw new NotFoundException('Comissão não encontrada');
    }

    return commission;
  }
}
