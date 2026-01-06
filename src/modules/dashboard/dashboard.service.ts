import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { Prisma } from '@prisma/client';
import { ConsumerStatus, GeneratorStatus, ChangeRequestStatus } from '../../common/enums';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardData() {
    // Estatísticas básicas
    const totalGenerators = await this.prisma.generator.count();
    const totalConsumers = await this.prisma.consumer.count();
    
    // Potência instalada total
    const totalInstalledPower = await this.prisma.generator.aggregate({
      _sum: {
        installedPower: true,
      },
    });

    // Clientes novos na semana (últimos 7 dias)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newGeneratorsThisWeek = await this.prisma.generator.count({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    });

    const newConsumersThisWeek = await this.prisma.consumer.count({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    });

    // Distribuição por estado
    const generatorsByState = await this.prisma.generator.groupBy({
      by: ['state'],
      _count: {
        id: true,
      },
      _sum: {
        installedPower: true,
      },
    });

    const consumersByState = await this.prisma.consumer.groupBy({
      by: ['state'],
      _count: {
        id: true,
      },
      _sum: {
        averageMonthlyConsumption: true,
      },
    });

    // Atividade recente (últimos 10 registros)
    const recentActivity = await this.getRecentActivity();

    // Insights
    const insights = await this.calculateInsights();

    // Gráfico de distribuição por estado
    const stateDistribution = this.mergeStateData(generatorsByState, consumersByState);

    // Notificações de mudanças pendentes
    const pendingChangeRequests = await this.getPendingChangeRequests();

    // Consumidores pendentes de aprovação
    const pendingConsumers = await this.prisma.consumer.count({
      where: {
        approvalStatus: 'PENDING',
      },
    });

    return {
      summary: {
        totalGenerators,
        totalConsumers,
        totalInstalledPower: totalInstalledPower._sum.installedPower || 0,
        newClientsThisWeek: newGeneratorsThisWeek + newConsumersThisWeek,
        newGeneratorsThisWeek,
        newConsumersThisWeek,
        pendingConsumers,
        pendingChangeRequests: pendingChangeRequests.count,
      },
      stateDistribution,
      recentActivity,
      insights,
      notifications: {
        pendingChangeRequests: pendingChangeRequests.requests,
        pendingConsumers,
      },
    };
  }

  private async getPendingChangeRequests() {
    const requests = await this.prisma.consumerChangeRequest.findMany({
      where: {
        status: ChangeRequestStatus.PENDING,
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
          },
        },
        representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
      take: 10,
    });

    return {
      count: await this.prisma.consumerChangeRequest.count({
        where: {
          status: ChangeRequestStatus.PENDING,
        },
      }),
      requests: requests.map(req => ({
        id: req.id,
        consumerId: req.consumerId,
        consumerName: req.consumer.name,
        representativeName: req.representative.name,
        changedFields: req.changedFields,
        requestedAt: req.requestedAt,
      })),
    };
  }

  private async getRecentActivity() {
    // Busca os últimos geradores criados
    const recentGenerators = await this.prisma.generator.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        ownerName: true,
        sourceType: true,
        createdAt: true,
      },
    });

    // Busca os últimos consumidores criados
    const recentConsumers = await this.prisma.consumer.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        consumerType: true,
        createdAt: true,
      },
    });

    // Combina e ordena por data
    const activities = [
      ...recentGenerators.map(gen => ({
        id: gen.id,
        type: 'generator' as const,
        name: gen.ownerName,
        subtype: gen.sourceType,
        createdAt: gen.createdAt,
      })),
      ...recentConsumers.map(cons => ({
        id: cons.id,
        type: 'consumer' as const,
        name: cons.name,
        subtype: cons.consumerType,
        createdAt: cons.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);

    return activities;
  }

  private async calculateInsights() {
    // Consumo total mensal
    const totalMonthlyConsumption = await this.prisma.consumer.aggregate({
      _sum: {
        averageMonthlyConsumption: true,
      },
    });

    // Taxa de alocação
    const totalConsumers = await this.prisma.consumer.count();
    const allocatedConsumers = await this.prisma.consumer.count({
      where: { status: ConsumerStatus.ALLOCATED },
    });

    const allocationRate = totalConsumers > 0 ? (allocatedConsumers / totalConsumers) * 100 : 0;

    // Economia estimada (baseada na energia alocada)
    const allocatedConsumersData = await this.prisma.consumer.findMany({
      where: {
        status: ConsumerStatus.ALLOCATED,
        allocatedPercentage: { not: null },
      },
      include: {
        generator: true,
      },
    });

    let totalAllocatedEnergy = 0;
    let estimatedSavings = 0;

    allocatedConsumersData.forEach(consumer => {
      if (consumer.generator && consumer.allocatedPercentage) {
        const allocatedEnergy = (consumer.averageMonthlyConsumption * consumer.allocatedPercentage) / 100;
        totalAllocatedEnergy += allocatedEnergy;
        
        // Estimativa de economia: desconto oferecido aplicado à energia alocada
        // Assumindo um valor médio de R$ 0,65 por kWh
        const energyCost = allocatedEnergy * 0.65;
        const savings = energyCost * (consumer.discountOffered / 100);
        estimatedSavings += savings;
      }
    });

    // Capacidade disponível vs alocada
    const totalInstalledPower = await this.prisma.generator.aggregate({
      _sum: {
        installedPower: true,
      },
    });

    let totalAllocatedCapacity = 0;
    allocatedConsumersData.forEach(consumer => {
      if (consumer.generator && consumer.allocatedPercentage) {
        totalAllocatedCapacity += (consumer.generator.installedPower * consumer.allocatedPercentage) / 100;
      }
    });

    const totalCapacity = totalInstalledPower._sum.installedPower || 0;
    const capacityAllocationRate = totalCapacity > 0 ? (totalAllocatedCapacity / totalCapacity) * 100 : 0;

    // Status dos geradores
    const generatorsUnderAnalysis = await this.prisma.generator.count({
      where: { status: GeneratorStatus.UNDER_ANALYSIS },
    });

    const generatorsAwaitingAllocation = await this.prisma.generator.count({
      where: { status: GeneratorStatus.AWAITING_ALLOCATION },
    });

    return {
      totalMonthlyConsumption: totalMonthlyConsumption._sum.averageMonthlyConsumption || 0,
      allocationRate: Math.round(allocationRate * 100) / 100,
      estimatedMonthlySavings: Math.round(estimatedSavings * 100) / 100,
      totalAllocatedEnergy: Math.round(totalAllocatedEnergy * 100) / 100,
      capacityUtilization: {
        totalCapacity,
        allocatedCapacity: Math.round(totalAllocatedCapacity * 100) / 100,
        availableCapacity: Math.round((totalCapacity - totalAllocatedCapacity) * 100) / 100,
        utilizationRate: Math.round(capacityAllocationRate * 100) / 100,
      },
      generatorStatus: {
        underAnalysis: generatorsUnderAnalysis,
        awaitingAllocation: generatorsAwaitingAllocation,
      },
    };
  }

  private mergeStateData(generatorsByState: any[], consumersByState: any[]) {
    const stateMap = new Map();

    // Adiciona dados dos geradores
    generatorsByState.forEach(item => {
      stateMap.set(item.state, {
        state: item.state,
        generators: item._count.id,
        totalInstalledPower: item._sum.installedPower || 0,
        consumers: 0,
        totalConsumption: 0,
      });
    });

    // Adiciona dados dos consumidores
    consumersByState.forEach(item => {
      const existing = stateMap.get(item.state) || {
        state: item.state,
        generators: 0,
        totalInstalledPower: 0,
        consumers: 0,
        totalConsumption: 0,
      };

      existing.consumers = item._count.id;
      existing.totalConsumption = item._sum.averageMonthlyConsumption || 0;
      stateMap.set(item.state, existing);
    });

    return Array.from(stateMap.values()).sort((a, b) => 
      (b.generators + b.consumers) - (a.generators + a.consumers)
    );
  }

  async getGeneratorsBySourceType() {
    const data = await this.prisma.generator.groupBy({
      by: ['sourceType'],
      _count: {
        id: true,
      },
      _sum: {
        installedPower: true,
      },
    });

    return data.map(item => ({
      sourceType: item.sourceType,
      count: item._count.id,
      totalPower: item._sum.installedPower || 0,
    }));
  }

  async getConsumersByType() {
    const data = await this.prisma.consumer.groupBy({
      by: ['consumerType'],
      _count: {
        id: true,
      },
      _sum: {
        averageMonthlyConsumption: true,
      },
    });

    return data.map(item => ({
      consumerType: item.consumerType,
      count: item._count.id,
      totalConsumption: item._sum.averageMonthlyConsumption || 0,
    }));
  }
}

