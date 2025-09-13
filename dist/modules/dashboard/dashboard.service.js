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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardData() {
        const totalGenerators = await this.prisma.generator.count();
        const totalConsumers = await this.prisma.consumer.count();
        const totalInstalledPower = await this.prisma.generator.aggregate({
            _sum: {
                installedPower: true,
            },
        });
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
        const recentActivity = await this.getRecentActivity();
        const insights = await this.calculateInsights();
        const stateDistribution = this.mergeStateData(generatorsByState, consumersByState);
        return {
            summary: {
                totalGenerators,
                totalConsumers,
                totalInstalledPower: totalInstalledPower._sum.installedPower || 0,
                newClientsThisWeek: newGeneratorsThisWeek + newConsumersThisWeek,
                newGeneratorsThisWeek,
                newConsumersThisWeek,
            },
            stateDistribution,
            recentActivity,
            insights,
        };
    }
    async getRecentActivity() {
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
        const activities = [
            ...recentGenerators.map(gen => ({
                id: gen.id,
                type: 'generator',
                name: gen.ownerName,
                subtype: gen.sourceType,
                createdAt: gen.createdAt,
            })),
            ...recentConsumers.map(cons => ({
                id: cons.id,
                type: 'consumer',
                name: cons.name,
                subtype: cons.consumerType,
                createdAt: cons.createdAt,
            })),
        ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);
        return activities;
    }
    async calculateInsights() {
        const totalMonthlyConsumption = await this.prisma.consumer.aggregate({
            _sum: {
                averageMonthlyConsumption: true,
            },
        });
        const totalConsumers = await this.prisma.consumer.count();
        const allocatedConsumers = await this.prisma.consumer.count({
            where: { status: client_1.ConsumerStatus.ALLOCATED },
        });
        const allocationRate = totalConsumers > 0 ? (allocatedConsumers / totalConsumers) * 100 : 0;
        const allocatedConsumersData = await this.prisma.consumer.findMany({
            where: {
                status: client_1.ConsumerStatus.ALLOCATED,
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
                const energyCost = allocatedEnergy * 0.65;
                const savings = energyCost * (consumer.discountOffered / 100);
                estimatedSavings += savings;
            }
        });
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
        const generatorsUnderAnalysis = await this.prisma.generator.count({
            where: { status: client_1.GeneratorStatus.UNDER_ANALYSIS },
        });
        const generatorsAwaitingAllocation = await this.prisma.generator.count({
            where: { status: client_1.GeneratorStatus.AWAITING_ALLOCATION },
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
    mergeStateData(generatorsByState, consumersByState) {
        const stateMap = new Map();
        generatorsByState.forEach(item => {
            stateMap.set(item.state, {
                state: item.state,
                generators: item._count.id,
                totalInstalledPower: item._sum.installedPower || 0,
                consumers: 0,
                totalConsumption: 0,
            });
        });
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
        return Array.from(stateMap.values()).sort((a, b) => (b.generators + b.consumers) - (a.generators + a.consumers));
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map