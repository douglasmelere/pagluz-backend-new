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
exports.AdvancedDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let AdvancedDashboardService = class AdvancedDashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConsumerGrowth(months = 12, representativeId) {
        const data = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const where = { createdAt: { gte: start, lte: end } };
            if (representativeId)
                where.representativeId = representativeId;
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
    async getCommissionGrowth(months = 12, representativeId) {
        const data = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const where = { calculatedAt: { gte: start, lte: end } };
            if (representativeId)
                where.representativeId = representativeId;
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
    async getKwhEvolution(months = 12, representativeId) {
        const data = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const where = {
                createdAt: { lte: end },
                status: { in: ['ALLOCATED', 'CONVERTED'] },
            };
            if (representativeId)
                where.representativeId = representativeId;
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
    async getConcessionaireDistribution(representativeId) {
        const where = {};
        if (representativeId)
            where.representativeId = representativeId;
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
    async getConsumerTypeDistribution(representativeId) {
        const where = {};
        if (representativeId)
            where.representativeId = representativeId;
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
    async getGeographicDistribution(representativeId) {
        const where = {};
        if (representativeId)
            where.representativeId = representativeId;
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
    async getFullDashboard(months = 12, representativeId) {
        const [consumerGrowth, commissionGrowth, kwhEvolution, concessionaireDistribution, consumerTypeDistribution, geographicDistribution,] = await Promise.all([
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
};
exports.AdvancedDashboardService = AdvancedDashboardService;
exports.AdvancedDashboardService = AdvancedDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdvancedDashboardService);
//# sourceMappingURL=advanced-dashboard.service.js.map