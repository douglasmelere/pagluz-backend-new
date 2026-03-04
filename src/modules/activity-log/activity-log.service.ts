import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class ActivityLogService {
  constructor(private prisma: PrismaService) { }

  // ─── Registrar atividade ────────────────────────────────────────────────────

  async log(data: {
    entityType: string;
    entityId: string;
    action: string;
    description: string;
    representativeId?: string;
    performedBy?: string;
    performedByName?: string;
    performedByRole?: string;
    details?: any;
  }) {
    return this.prisma.activityLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        description: data.description,
        representativeId: data.representativeId ?? null,
        performedBy: data.performedBy ?? null,
        performedByName: data.performedByName ?? null,
        performedByRole: data.performedByRole ?? null,
        details: data.details ?? null,
      },
    });
  }

  // ─── Timeline de uma entidade (ex: consumidor) ──────────────────────────────

  async getEntityTimeline(entityType: string, entityId: string) {
    return this.prisma.activityLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      include: {
        representative: { select: { id: true, name: true } },
      },
    });
  }

  // ─── Timeline de um representante ───────────────────────────────────────────

  async getRepresentativeTimeline(representativeId: string, limit = 50) {
    return this.prisma.activityLog.findMany({
      where: { representativeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // ─── Timeline geral (admin) ─────────────────────────────────────────────────

  async getGlobalTimeline(filters: {
    entityType?: string;
    action?: string;
    representativeId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const where: any = {};
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = filters.action;
    if (filters.representativeId) where.representativeId = filters.representativeId;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    return this.prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 100,
      include: {
        representative: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  }

  // ─── Estatísticas de atividade ──────────────────────────────────────────────

  async getActivityStats(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [total, byType, byAction] = await Promise.all([
      this.prisma.activityLog.count({ where: { createdAt: { gte: since } } }),
      this.prisma.activityLog.groupBy({
        by: ['entityType'],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      }),
      this.prisma.activityLog.groupBy({
        by: ['action'],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      }),
    ]);

    return {
      totalActivities: total,
      byEntityType: byType.map(t => ({ type: t.entityType, count: t._count.id })),
      byAction: byAction.map(a => ({ action: a.action, count: a._count.id })),
      period: `Últimos ${days} dias`,
    };
  }
}
