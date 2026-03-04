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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let ReportsController = class ReportsController {
    service;
    constructor(service) {
        this.service = service;
    }
    exportCommissions(res, representativeId, startDate, endDate, status) {
        return this.service.generateCommissionsReport(res, { representativeId, startDate, endDate, status });
    }
    exportConsumers(res, representativeId, status, concessionaire) {
        return this.service.generateConsumersReport(res, { representativeId, status, concessionaire });
    }
    exportRepresentatives(res) {
        return this.service.generateRepresentativesReport(res);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('commissions'),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar relatório de comissões (Excel)' }),
    (0, swagger_1.ApiQuery)({ name: 'representativeId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, example: '2026-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, example: '2026-12-31' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['PENDING', 'CALCULATED', 'PAID', 'CANCELLED'] }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('representativeId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "exportCommissions", null);
__decorate([
    (0, common_1.Get)('consumers'),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar relatório de consumidores (Excel)' }),
    (0, swagger_1.ApiQuery)({ name: 'representativeId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['AVAILABLE', 'ALLOCATED', 'IN_PROCESS', 'CONVERTED'] }),
    (0, swagger_1.ApiQuery)({ name: 'concessionaire', required: false }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('representativeId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('concessionaire')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "exportConsumers", null);
__decorate([
    (0, common_1.Get)('representatives'),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar relatório de performance dos representantes (Excel)' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "exportRepresentatives", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Relatórios'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map