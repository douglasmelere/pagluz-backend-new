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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getDashboard() {
        return this.dashboardService.getDashboardData();
    }
    getGeneratorsBySourceType() {
        return this.dashboardService.getGeneratorsBySourceType();
    }
    getConsumersByType() {
        return this.dashboardService.getConsumersByType();
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obter dados completos da dashboard',
        description: 'Retorna todos os indicadores, estatísticas e insights da dashboard'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Dados da dashboard obtidos com sucesso',
        schema: {
            type: 'object',
            properties: {
                summary: {
                    type: 'object',
                    properties: {
                        totalGenerators: { type: 'number', description: 'Total de geradores cadastrados' },
                        totalConsumers: { type: 'number', description: 'Total de consumidores cadastrados' },
                        totalInstalledPower: { type: 'number', description: 'Potência instalada total (kWh)' },
                        newClientsThisWeek: { type: 'number', description: 'Novos clientes na semana' },
                        newGeneratorsThisWeek: { type: 'number', description: 'Novos geradores na semana' },
                        newConsumersThisWeek: { type: 'number', description: 'Novos consumidores na semana' },
                    },
                },
                stateDistribution: {
                    type: 'array',
                    description: 'Distribuição por estado',
                    items: {
                        type: 'object',
                        properties: {
                            state: { type: 'string' },
                            generators: { type: 'number' },
                            consumers: { type: 'number' },
                            totalInstalledPower: { type: 'number' },
                            totalConsumption: { type: 'number' },
                        },
                    },
                },
                recentActivity: {
                    type: 'array',
                    description: 'Atividade recente no sistema',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            type: { type: 'string', enum: ['generator', 'consumer'] },
                            name: { type: 'string' },
                            subtype: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                        },
                    },
                },
                insights: {
                    type: 'object',
                    properties: {
                        totalMonthlyConsumption: { type: 'number', description: 'Consumo total mensal (kWh)' },
                        allocationRate: { type: 'number', description: 'Taxa de alocação (%)' },
                        estimatedMonthlySavings: { type: 'number', description: 'Economia estimada mensal (R$)' },
                        totalAllocatedEnergy: { type: 'number', description: 'Energia total alocada (kWh)' },
                        capacityUtilization: {
                            type: 'object',
                            properties: {
                                totalCapacity: { type: 'number' },
                                allocatedCapacity: { type: 'number' },
                                availableCapacity: { type: 'number' },
                                utilizationRate: { type: 'number' },
                            },
                        },
                        generatorStatus: {
                            type: 'object',
                            properties: {
                                underAnalysis: { type: 'number' },
                                awaitingAllocation: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
    }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getDashboard", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obter distribuição de geradores por tipo de fonte',
        description: 'Retorna a quantidade e potência total por tipo de fonte de energia'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Distribuição por tipo de fonte obtida com sucesso'
    }),
    (0, common_1.Get)('generators-by-source'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getGeneratorsBySourceType", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Obter distribuição de consumidores por tipo',
        description: 'Retorna a quantidade e consumo total por tipo de consumidor'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Distribuição por tipo de consumidor obtida com sucesso'
    }),
    (0, common_1.Get)('consumers-by-type'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getConsumersByType", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map