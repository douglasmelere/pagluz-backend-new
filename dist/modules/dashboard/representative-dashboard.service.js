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
exports.RepresentativeDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const client_1 = require("@prisma/client");
let RepresentativeDashboardService = class RepresentativeDashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getRepresentativeDashboard(representativeId) {
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
        const stats = this.calculateRepresentativeStats(representative.Consumer);
        const consumersByStatus = this.groupConsumersByStatus(representative.Consumer);
        const geographicDistribution = this.calculateGeographicDistribution(representative.Consumer);
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
    calculateRepresentativeStats(consumers) {
        const totalConsumers = consumers.length;
        const totalKwh = consumers.reduce((sum, consumer) => sum + consumer.averageMonthlyConsumption, 0);
        const allocatedConsumers = consumers.filter(c => c.status === client_1.ConsumerStatus.ALLOCATED && c.allocatedPercentage);
        let allocatedKwh = 0;
        allocatedConsumers.forEach(consumer => {
            allocatedKwh += (consumer.averageMonthlyConsumption * consumer.allocatedPercentage) / 100;
        });
        const pendingKwh = totalKwh - allocatedKwh;
        const allocationRate = totalKwh > 0 ? (allocatedKwh / totalKwh) * 100 : 0;
        let estimatedSavings = 0;
        allocatedConsumers.forEach(consumer => {
            const allocatedEnergy = (consumer.averageMonthlyConsumption * consumer.allocatedPercentage) / 100;
            const energyCost = allocatedEnergy * 0.65;
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
    groupConsumersByStatus(consumers) {
        const statusGroups = {
            allocated: consumers.filter(c => c.status === client_1.ConsumerStatus.ALLOCATED),
            inProcess: consumers.filter(c => c.status === client_1.ConsumerStatus.IN_PROCESS),
            converted: consumers.filter(c => c.status === client_1.ConsumerStatus.CONVERTED),
            available: consumers.filter(c => c.status === client_1.ConsumerStatus.AVAILABLE),
        };
        return {
            allocated: {
                count: statusGroups.allocated.length,
                totalKwh: Math.round(statusGroups.allocated.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0) * 100) / 100,
                consumers: statusGroups.allocated,
            },
            inProcess: {
                count: statusGroups.inProcess.length,
                totalKwh: Math.round(statusGroups.inProcess.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0) * 100) / 100,
                consumers: statusGroups.inProcess,
            },
            converted: {
                count: statusGroups.converted.length,
                totalKwh: Math.round(statusGroups.converted.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0) * 100) / 100,
                consumers: statusGroups.converted,
            },
            available: {
                count: statusGroups.available.length,
                totalKwh: Math.round(statusGroups.available.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0) * 100) / 100,
                consumers: statusGroups.available,
            },
        };
    }
    calculateGeographicDistribution(consumers) {
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
            if (consumer.status === client_1.ConsumerStatus.ALLOCATED && consumer.allocatedPercentage) {
                existing.allocatedKwh += (consumer.averageMonthlyConsumption * consumer.allocatedPercentage) / 100;
            }
            else {
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
    async calculateMonthlyEvolution(representativeId) {
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
        const monthlyMap = new Map();
        monthlyData.forEach(item => {
            const month = item.createdAt.toISOString().substring(0, 7);
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
};
exports.RepresentativeDashboardService = RepresentativeDashboardService;
exports.RepresentativeDashboardService = RepresentativeDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RepresentativeDashboardService);
//# sourceMappingURL=representative-dashboard.service.js.map