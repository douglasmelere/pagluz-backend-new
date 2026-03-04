import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class AdvancedDashboardService {
  constructor(private prisma: PrismaService) { }

  // ─── Evolução mensal de novos consumidores ──────────────────────────────────

  async getConsumerGrowth(months = 12, representativeId?: string) {
    const data: any[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const where: any = { createdAt: { gte: start, lte: end } };
      if (representativeId) where.representativeId = representativeId;

      const [total, converted, allocated] = await Promise.all([
        this.prisma.consumer.count({ where }),
        this.prisma.consumer.count({ where: { ...where, status: 'CONVERTED' } }),
        this.prisma.consumer.count({ where: { ...where, status: { in: ['ALLOCATED', 'CONVERTED'] } } }),
      ]);

      data.push({
        month: start.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        year: start.getFullYear(),
        monthNum: start.getMonth() + 1,
        total,
        converted,
        allocated,
      });
    }

    return data;
  }

  // ─── Evolução mensal de comissões ───────────────────────────────────────────

  async getCommissionGrowth(months = 12, representativeId?: string) {
    const data: any[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const where: any = { calculatedAt: { gte: start, lte: end } };
      if (representativeId) where.representativeId = representativeId;

      const commissions = await this.prisma.commission.findMany({
        where,
        select: { commissionValue: true, status: true, kwhConsumption: true },
      });

      const totalValue = commissions.reduce((s, c) => s + c.commissionValue, 0);
      const paidValue = commissions.filter(c => c.status === 'PAID').reduce((s, c) => s + c.commissionValue, 0);
      const totalKwh = commissions.reduce((s, c) => s + c.kwhConsumption, 0);

      data.push({
        month: start.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        year: start.getFullYear(),
        monthNum: start.getMonth() + 1,
        totalValue: Math.round(totalValue * 100) / 100,
        paidValue: Math.round(paidValue * 100) / 100,
        pendingValue: Math.round((totalValue - paidValue) * 100) / 100,
        totalKwh: Math.round(totalKwh * 100) / 100,
        count: commissions.length,
      });
    }

    return data;
  }

  // ─── Evolução de kWh alocado ────────────────────────────────────────────────

  async getKwhEvolution(months = 12, representativeId?: string) {
    const data: any[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const where: any = {
        createdAt: { lte: end },
        status: { in: ['ALLOCATED', 'CONVERTED'] },
      };
      if (representativeId) where.representativeId = representativeId;

      const consumers = await this.prisma.consumer.findMany({
        where,
        select: { averageMonthlyConsumption: true, allocatedPercentage: true },
      });

      const totalKwh = consumers.reduce((s, c) => s + c.averageMonthlyConsumption, 0);
      const allocatedKwh = consumers.reduce((s, c) => {
        const perc = c.allocatedPercentage || 0;
        return s + (c.averageMonthlyConsumption * perc / 100);
      }, 0);

      data.push({
        month: end.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        totalKwh: Math.round(totalKwh),
        allocatedKwh: Math.round(allocatedKwh),
        consumers: consumers.length,
      });
    }

    return data;
  }

  // ─── Distribuição por concessionária ────────────────────────────────────────

  async getConcessionaireDistribution(representativeId?: string) {
    const where: any = {};
    if (representativeId) where.representativeId = representativeId;

    const result = await this.prisma.consumer.groupBy({
      by: ['concessionaire'],
      where,
      _count: { id: true },
      _sum: { averageMonthlyConsumption: true },
    });

    return result.map(r => ({
      concessionaire: r.concessionaire,
      count: r._count.id,
      totalKwh: Math.round((r._sum.averageMonthlyConsumption || 0) * 100) / 100,
    })).sort((a, b) => b.count - a.count);
  }

  // ─── Distribuição por tipo de consumidor ────────────────────────────────────

  async getConsumerTypeDistribution(representativeId?: string) {
    const where: any = {};
    if (representativeId) where.representativeId = representativeId;

    const result = await this.prisma.consumer.groupBy({
      by: ['consumerType'],
      where,
      _count: { id: true },
      _sum: { averageMonthlyConsumption: true },
    });

    const typeLabels = {
      RESIDENTIAL: 'Residencial',
      COMMERCIAL: 'Comercial',
      INDUSTRIAL: 'Industrial',
      RURAL: 'Rural',
      PUBLIC_POWER: 'Poder Público',
    };

    return result.map(r => ({
      type: r.consumerType,
      label: typeLabels[r.consumerType] || r.consumerType,
      count: r._count.id,
      totalKwh: Math.round((r._sum.averageMonthlyConsumption || 0) * 100) / 100,
    })).sort((a, b) => b.count - a.count);
  }

  // ─── Distribuição geográfica ────────────────────────────────────────────────

  async getGeographicDistribution(representativeId?: string) {
    const where: any = {};
    if (representativeId) where.representativeId = representativeId;

    const result = await this.prisma.consumer.groupBy({
      by: ['state', 'city'],
      where,
      _count: { id: true },
    });

    return result.map(r => ({
      state: r.state,
      city: r.city,
      count: r._count.id,
    })).sort((a, b) => b.count - a.count);
  }

  // ─── Resumo completo para dashboard ─────────────────────────────────────────

  async getFullDashboard(months = 12, representativeId?: string) {
    const [
      consumerGrowth,
      commissionGrowth,
      kwhEvolution,
      concessionaireDistribution,
      consumerTypeDistribution,
      geographicDistribution,
    ] = await Promise.all([
      this.getConsumerGrowth(months, representativeId),
      this.getCommissionGrowth(months, representativeId),
      this.getKwhEvolution(months, representativeId),
      this.getConcessionaireDistribution(representativeId),
      this.getConsumerTypeDistribution(representativeId),
      this.getGeographicDistribution(representativeId),
    ]);

    return {
      consumerGrowth,
      commissionGrowth,
      kwhEvolution,
      concessionaireDistribution,
      consumerTypeDistribution,
      geographicDistribution,
    };
  }
}
