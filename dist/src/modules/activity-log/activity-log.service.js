"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let ActivityLogService = class ActivityLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(data) {
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
    async getEntityTimeline(entityType, entityId) {
        return this.prisma.activityLog.findMany({
            where: { entityType, entityId },
            orderBy: { createdAt: 'desc' },
            include: {
                representative: { select: { id: true, name: true } },
            },
        });
    }
    async getRepresentativeTimeline(representativeId, limit = 50) {
        return this.prisma.activityLog.findMany({
            where: { representativeId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getGlobalTimeline(filters) {
        const where = {};
        if (filters.entityType)
            where.entityType = filters.entityType;
        if (filters.action)
            where.action = filters.action;
        if (filters.representativeId)
            where.representativeId = filters.representativeId;
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate)
                where.createdAt.gte = new Date(filters.startDate);
            if (filters.endDate)
                where.createdAt.lte = new Date(filters.endDate);
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
};
exports.ActivityLogService = ActivityLogService;
exports.ActivityLogService = ActivityLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityLogService);
//# sourceMappingURL=activity-log.service.js.map