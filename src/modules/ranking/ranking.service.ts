import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) { }

  // ─── Ranking Geral ──────────────────────────────────────────────────────────

  async getRanking(period?: string) {
    // period: 'month', 'quarter', 'year', 'all'
    const dateFilter = this.getDateFilter(period || 'all');

    const representatives = await this.prisma.representative.findMany({
      where: { status: 'ACTIVE' },
      include: {
        Consumer: {
          where: dateFilter ? { createdAt: dateFilter } : undefined,
          select: {
            id: true,
            status: true,
            averageMonthlyConsumption: true,
            allocatedPercentage: true,
          },
        },
        commissions: {
          where: dateFilter ? { calculatedAt: dateFilter } : undefined,
          select: { commissionValue: true, status: true, kwhConsumption: true },
        },
        badges: true,
      },
    });

    const ranking = representatives.map(rep => {
      const totalClients = rep.Consumer.length;
      const convertedClients = rep.Consumer.filter(c => c.status === 'CONVERTED').length;
      const allocatedClients = rep.Consumer.filter(c => c.status === 'ALLOCATED' || c.status === 'CONVERTED').length;
      const totalKwh = rep.Consumer.reduce((s, c) => s + c.averageMonthlyConsumption, 0);
      const totalCommissions = rep.commissions.reduce((s, c) => s + c.commissionValue, 0);
      const paidCommissions = rep.commissions.filter(c => c.status === 'PAID').reduce((s, c) => s + c.commissionValue, 0);
      const conversionRate = totalClients > 0 ? (convertedClients / totalClients) * 100 : 0;

      // Score composto: clientes convertidos + kWh (peso menor) + comissões (peso maior)
      const score = (convertedClients * 100) + (totalKwh * 0.01) + (totalCommissions * 0.5);

      return {
        id: rep.id,
        name: rep.name,
        email: rep.email,
        city: rep.city,
        state: rep.state,
        avatarUrl: rep.avatarUrl,
        totalClients,
        convertedClients,
        allocatedClients,
        totalKwh: Math.round(totalKwh * 100) / 100,
        totalCommissions: Math.round(totalCommissions * 100) / 100,
        paidCommissions: Math.round(paidCommissions * 100) / 100,
        conversionRate: Math.round(conversionRate * 10) / 10,
        badgesCount: rep.badges.length,
        score: Math.round(score),
      };
    });

    // Ordena pelo score
    ranking.sort((a, b) => b.score - a.score);

    // Adiciona posição
    return ranking.map((r, i) => ({ ...r, position: i + 1 }));
  }

  // ─── Badges / Conquistas ────────────────────────────────────────────────────

  async getBadges(representativeId: string) {
    return this.prisma.representativeBadge.findMany({
      where: { representativeId },
      orderBy: { earnedAt: 'desc' },
    });
  }

  // Badge definitions
  private badgeDefinitions = [
    { key: 'first_client', name: '🎯 Primeiro Cliente', description: 'Converteu o primeiro cliente', icon: '🎯', check: (stats) => stats.convertedClients >= 1 },
    { key: '10_clients', name: '⭐ 10 Clientes', description: 'Converteu 10 clientes', icon: '⭐', check: (stats) => stats.convertedClients >= 10 },
    { key: '50_clients', name: '🏆 50 Clientes', description: 'Converteu 50 clientes', icon: '🏆', check: (stats) => stats.convertedClients >= 50 },
    { key: '100_clients', name: '💎 100 Clientes', description: 'Converteu 100 clientes', icon: '💎', check: (stats) => stats.convertedClients >= 100 },
    { key: '1000_kwh', name: '⚡ 1.000 kWh', description: 'Atingiu 1.000 kWh de consumo alocado', icon: '⚡', check: (stats) => stats.totalKwh >= 1000 },
    { key: '10000_kwh', name: '🔋 10.000 kWh', description: 'Atingiu 10.000 kWh de consumo alocado', icon: '🔋', check: (stats) => stats.totalKwh >= 10000 },
    { key: '100000_kwh', name: '🌞 100.000 kWh', description: 'Atingiu 100.000 kWh de consumo alocado', icon: '🌞', check: (stats) => stats.totalKwh >= 100000 },
    { key: 'first_commission', name: '💰 Primeira Comissão', description: 'Recebeu a primeira comissão', icon: '💰', check: (stats) => stats.paidCommissions > 0 },
    { key: 'high_conversion', name: '📈 Alta Conversão', description: 'Taxa de conversão acima de 50%', icon: '📈', check: (stats) => stats.conversionRate >= 50 && stats.totalClients >= 5 },
    { key: 'perfect_conversion', name: '🎖️ Conversão Perfeita', description: 'Taxa de conversão de 100% com 10+ clientes', icon: '🎖️', check: (stats) => stats.conversionRate === 100 && stats.totalClients >= 10 },
  ];

  async checkAndAwardBadges(representativeId: string) {
    const rep = await this.prisma.representative.findUnique({
      where: { id: representativeId },
      include: {
        Consumer: { select: { status: true, averageMonthlyConsumption: true } },
        commissions: { select: { commissionValue: true, status: true } },
        badges: true,
      },
    });

    if (!rep) return [];

    const stats = {
      totalClients: rep.Consumer.length,
      convertedClients: rep.Consumer.filter(c => c.status === 'CONVERTED').length,
      totalKwh: rep.Consumer.reduce((s, c) => s + c.averageMonthlyConsumption, 0),
      paidCommissions: rep.commissions.filter(c => c.status === 'PAID').reduce((s, c) => s + c.commissionValue, 0),
      conversionRate: rep.Consumer.length > 0
        ? (rep.Consumer.filter(c => c.status === 'CONVERTED').length / rep.Consumer.length) * 100
        : 0,
    };

    const existingBadges = new Set(rep.badges.map(b => b.badgeKey));
    const newBadges: any[] = [];

    for (const badge of this.badgeDefinitions) {
      if (!existingBadges.has(badge.key) && badge.check(stats)) {
        const created = await this.prisma.representativeBadge.create({
          data: {
            representativeId,
            badgeKey: badge.key,
            badgeName: badge.name,
            badgeDescription: badge.description,
            badgeIcon: badge.icon,
          },
        });
        newBadges.push(created);
      }
    }

    return newBadges;
  }

  // ─── Metas / Goals ──────────────────────────────────────────────────────────

  async getGoals(representativeId: string) {
    const goals = await this.prisma.representativeGoal.findMany({
      where: { representativeId },
      orderBy: { periodEnd: 'desc' },
    });

    return goals.map(g => ({
      ...g,
      progressPercent: g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100 * 10) / 10) : 0,
    }));
  }

  async createGoal(data: {
    representativeId: string;
    title: string;
    type: string;
    targetValue: number;
    unit: string;
    periodStart: string;
    periodEnd: string;
    createdByUserId?: string;
  }) {
    return this.prisma.representativeGoal.create({
      data: {
        representativeId: data.representativeId,
        title: data.title,
        type: data.type as any,
        targetValue: data.targetValue,
        unit: data.unit,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        createdByUserId: data.createdByUserId,
      },
    });
  }

  async updateGoalProgress(goalId: string, currentValue: number) {
    const goal = await this.prisma.representativeGoal.findUnique({ where: { id: goalId } });
    if (!goal) throw new Error('Meta não encontrada');

    const status = currentValue >= goal.targetValue ? 'ACHIEVED' : 'IN_PROGRESS';

    return this.prisma.representativeGoal.update({
      where: { id: goalId },
      data: { currentValue, status: status as any },
    });
  }

  async getAllGoals(filters?: { representativeId?: string; status?: string }) {
    const where: any = {};
    if (filters?.representativeId) where.representativeId = filters.representativeId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.representativeGoal.findMany({
      where,
      include: { representative: { select: { id: true, name: true, email: true } } },
      orderBy: { periodEnd: 'desc' },
    });
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private getDateFilter(period: string) {
    const now = new Date();
    let start: Date;

    switch (period) {
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const q = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), q, 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return null;
    }

    return { gte: start };
  }
}
