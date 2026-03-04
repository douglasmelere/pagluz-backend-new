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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedDashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const advanced_dashboard_service_1 = require("./advanced-dashboard.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const representative_jwt_auth_guard_1 = require("../../common/guards/representative-jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let AdvancedDashboardController = class AdvancedDashboardController {
    service;
    constructor(service) {
        this.service = service;
    }
    getRepDashboard(req, months) {
        return this.service.getFullDashboard(months ? parseInt(months) : 12, req.user.id);
    }
    getRepConsumerGrowth(req, months) {
        return this.service.getConsumerGrowth(months ? parseInt(months) : 12, req.user.id);
    }
    getRepCommissionGrowth(req, months) {
        return this.service.getCommissionGrowth(months ? parseInt(months) : 12, req.user.id);
    }
    getAdminDashboard(months, representativeId) {
        return this.service.getFullDashboard(months ? parseInt(months) : 12, representativeId);
    }
    getConsumerGrowth(months, representativeId) {
        return this.service.getConsumerGrowth(months ? parseInt(months) : 12, representativeId);
    }
    getCommissionGrowth(months, representativeId) {
        return this.service.getCommissionGrowth(months ? parseInt(months) : 12, representativeId);
    }
    getKwhEvolution(months, representativeId) {
        return this.service.getKwhEvolution(months ? parseInt(months) : 12, representativeId);
    }
    getConcessionaireDistribution(representativeId) {
        return this.service.getConcessionaireDistribution(representativeId);
    }
    getConsumerTypeDistribution(representativeId) {
        return this.service.getConsumerTypeDistribution(representativeId);
    }
    getGeographicDistribution(representativeId) {
        return this.service.getGeographicDistribution(representativeId);
    }
};
exports.AdvancedDashboardController = AdvancedDashboardController;
__decorate([
    (0, common_1.Get)('representative/full'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Dashboard completo com gráficos (Representante)' }),
    (0, swagger_1.ApiQuery)({ name: 'months', required: false, example: 12 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdvancedDashboardController.prototype, "getRepDashboard", null);
__decorate([
    (0, common_1.Get)('representative/consumer-growth'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Evolução de consumidores (Representante)' }),
    (0, swagger_1.ApiQuery)({ name: 'months', required: false, example: 12 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdvancedDashboardController.prototype, "getRepConsumerGrowth", null);
__decorate([
    (0, common_1.Get)('representative/commission-growth'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Evolução de comissões (Representante)' }),
    (0, swagger_1.ApiQuery)({ name: 'months', required: false, example: 12 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdvancedDashboardController.prototype, "getRepCommissionGrowth", null);
__decorate([
    (0, common_1.Get)('admin/full'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Dashboard completo com gráficos (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'months', required: false, example: 12 }),
    (0, swagger_1.ApiQuery)({ name: 'representativeId', required: false }),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('representativeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdvancedDashboardController.prototype, "getAdminDashboard", null);
__decorate([
    (0, common_1.Get)('admin/consumer-growth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Evolução de consumidores (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'months', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'representativeId', required: false }),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('representativeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdvancedDashboardController.prototype, "getConsumerGrowth", null);
__decorate([
    (0, common_1.Get)('admin/commission-growth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Evolução de comissões (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'months', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'representativeId', required: false }),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('representativeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdvancedDashboardController.prototype, "getCommissionGrowth", null);
__decorate([
    (0, common_1.Get)('admin/kwh-evolution'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Evolução de kWh alocado (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'months', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'representativeId', required: false }),
    __param(0, (0, common_1.Query)('months')),
    __param(1, (0, common_1.Query)('representativeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdvancedDashboardController.prototype, "getKwhEvolution", null);
__decorate([
    (0, common_1.Get)('admin/concessionaire-distribution'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Distribuição por concessionária (Admin)' }),
    __param(0, (0, common_1.Query)('representativeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedDashboardController.prototype, "getConcessionaireDistribution", null);
__decorate([
    (0, common_1.Get)('admin/consumer-type-distribution'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Distribuição por tipo de consumidor (Admin)' }),
    __param(0, (0, common_1.Query)('representativeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedDashboardController.prototype, "getConsumerTypeDistribution", null);
__decorate([
    (0, common_1.Get)('admin/geographic-distribution'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Distribuição geográfica (Admin)' }),
    __param(0, (0, common_1.Query)('representativeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvancedDashboardController.prototype, "getGeographicDistribution", null);
exports.AdvancedDashboardController = AdvancedDashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard Avançado'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('advanced-dashboard'),
    __metadata("design:paramtypes", [advanced_dashboard_service_1.AdvancedDashboardService])
], AdvancedDashboardController);
//# sourceMappingURL=advanced-dashboard.controller.js.map