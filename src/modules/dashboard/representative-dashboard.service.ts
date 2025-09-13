import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ConsumerStatus } from '@prisma/client';

@Injectable()
export class RepresentativeDashboardService {
  constructor(private prisma: PrismaService) {}

  async getRepresentativeDashboard(representativeId: string) {
    // Busca o representante com seus consumidores
    const representative = await this.prisma.representative.findUnique({
      where: { id: representativeId },
      include: {
        Consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
            ucNumber: true,
            concessionaire: true,
            city: true,
            state: true,
            consumerType: true,
            averageMonthlyConsumption: true,
            discountOffered: true,
            status: true,
            allocatedPercentage: true,
            createdAt: true,
            generator: {
              select: {
                id: true,
                ownerName: true,
                sourceType: true,
                installedPower: true,
                status: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!representative) {
      throw new Error('Representante não encontrado');
    }

    // Calcula estatísticas
    const stats = this.calculateRepresentativeStats(representative.Consumer);
    
    // Agrupa consumidores por status
    const consumersByStatus = this.groupConsumersByStatus(representative.Consumer);
    
    // Calcula distribuição geográfica
    const geographicDistribution = this.calculateGeographicDistribution(representative.Consumer);
    
    // Calcula evolução mensal
    const monthlyEvolution = await this.calculateMonthlyEvolution(representativeId);

    return {
      representative: {
        id: representative.id,
        name: representative.name,
        email: representative.email,
        status: representative.status,
        commissionRate: representative.commissionRate,
        specializations: representative.specializations,
        phone: representative.phone,
        city: representative.city,
        state: representative.state,
      },
      stats,
      consumersByStatus,
      geographicDistribution,
      monthlyEvolution,
      recentActivity: representative.Consumer.slice(0, 10),
    };
  }

  private calculateRepresentativeStats(consumers: any[]) {
    const totalConsumers = consumers.length;
    const totalKwh = consumers.reduce((sum, consumer) => sum + consumer.averageMonthlyConsumption, 0);
    
    // kWh alocados (status ALLOCATED com porcentagem alocada)
    const allocatedConsumers = consumers.filter(c => 
      c.status === ConsumerStatus.ALLOCATED && c.allocatedPercentage
    );
    
    let allocatedKwh = 0;
    allocatedConsumers.forEach(consumer => {
      allocatedKwh += (consumer.averageMonthlyConsumption * consumer.allocatedPercentage) / 100;
    });

    // kWh pendentes (todos os outros)
    const pendingKwh = totalKwh - allocatedKwh;

    // Taxa de alocação
    const allocationRate = totalKwh > 0 ? (allocatedKwh / totalKwh) * 100 : 0;

    // Economia estimada
    let estimatedSavings = 0;
    allocatedConsumers.forEach(consumer => {
      const allocatedEnergy = (consumer.averageMonthlyConsumption * consumer.allocatedPercentage) / 100;
      const energyCost = allocatedEnergy * 0.65; // R$ 0,65 por kWh
      const savings = energyCost * (consumer.discountOffered / 100);
      estimatedSavings += savings;
    });

    return {
      totalConsumers,
      totalKwh: Math.round(totalKwh * 100) / 100,
      allocatedKwh: Math.round(allocatedKwh * 100) / 100,
      pendingKwh: Math.round(pendingKwh * 100) / 100,
      allocationRate: Math.round(allocationRate * 100) / 100,
      estimatedMonthlySavings: Math.round(estimatedSavings * 100) / 100,
    };
  }

  private groupConsumersByStatus(consumers: any[]) {
    const statusGroups = {
      allocated: consumers.filter(c => c.status === ConsumerStatus.ALLOCATED),
      inProcess: consumers.filter(c => c.status === ConsumerStatus.IN_PROCESS),
      converted: consumers.filter(c => c.status === ConsumerStatus.CONVERTED),
      available: consumers.filter(c => c.status === ConsumerStatus.AVAILABLE),
    };

    return {
      allocated: {
        count: statusGroups.allocated.length,
        totalKwh: Math.round(
          statusGroups.allocated.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0) * 100
        ) / 100,
        consumers: statusGroups.allocated,
      },
      inProcess: {
        count: statusGroups.inProcess.length,
        totalKwh: Math.round(
          statusGroups.inProcess.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0) * 100
        ) / 100,
        consumers: statusGroups.inProcess,
      },
      converted: {
        count: statusGroups.converted.length,
        totalKwh: Math.round(
          statusGroups.converted.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0) * 100
        ) / 100,
        consumers: statusGroups.converted,
      },
      available: {
        count: statusGroups.available.length,
        totalKwh: Math.round(
          statusGroups.available.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0) * 100
        ) / 100,
        consumers: statusGroups.available,
      },
    };
  }

  private calculateGeographicDistribution(consumers: any[]) {
    const stateMap = new Map();

    consumers.forEach(consumer => {
      const state = consumer.state;
      const existing = stateMap.get(state) || {
        state,
        consumers: 0,
        totalKwh: 0,
        allocatedKwh: 0,
        pendingKwh: 0,
      };

      existing.consumers += 1;
      existing.totalKwh += consumer.averageMonthlyConsumption;

      if (consumer.status === ConsumerStatus.ALLOCATED && consumer.allocatedPercentage) {
        existing.allocatedKwh += (consumer.averageMonthlyConsumption * consumer.allocatedPercentage) / 100;
      } else {
        existing.pendingKwh += consumer.averageMonthlyConsumption;
      }

      stateMap.set(state, existing);
    });

    return Array.from(stateMap.values()).map(item => ({
      ...item,
      totalKwh: Math.round(item.totalKwh * 100) / 100,
      allocatedKwh: Math.round(item.allocatedKwh * 100) / 100,
      pendingKwh: Math.round(item.pendingKwh * 100) / 100,
    }));
  }

  private async calculateMonthlyEvolution(representativeId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await this.prisma.consumer.groupBy({
      by: ['createdAt'],
      where: {
        representativeId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        averageMonthlyConsumption: true,
      },
    });

    // Agrupa por mês
    const monthlyMap = new Map();
    monthlyData.forEach(item => {
      const month = item.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthlyMap.get(month) || {
        month,
        newConsumers: 0,
        totalKwh: 0,
      };

      existing.newConsumers += item._count.id;
      existing.totalKwh += item._sum.averageMonthlyConsumption || 0;

      monthlyMap.set(month, existing);
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        ...item,
        totalKwh: Math.round(item.totalKwh * 100) / 100,
      }));
  }

  async getCommercialMaterials() {
    // Aqui você pode implementar a lógica para retornar materiais comerciais
    // Por enquanto, retornando dados mockados
    return {
      materials: [
        {
          id: '1',
          title: 'Apresentação Comercial Pagluz',
          description: 'Apresentação completa sobre os serviços da Pagluz',
          type: 'presentation',
          url: '/materials/apresentacao-comercial.pdf',
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Catálogo de Produtos',
          description: 'Catálogo com todos os produtos e serviços disponíveis',
          type: 'catalog',
          url: '/materials/catalogo-produtos.pdf',
          updatedAt: new Date(),
        },
        {
          id: '3',
          title: 'Manual do Representante',
          description: 'Guia completo para representantes da Pagluz',
          type: 'manual',
          url: '/materials/manual-representante.pdf',
          updatedAt: new Date(),
        },
        {
          id: '4',
          title: 'Planilhas de Cálculo',
          description: 'Planilhas para cálculos de economia e alocação',
          type: 'spreadsheet',
          url: '/materials/planilhas-calculo.xlsx',
          updatedAt: new Date(),
        },
      ],
    };
  }
}
