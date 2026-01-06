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
exports.CommissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const commissions_service_1 = require("./commissions.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const representative_jwt_auth_guard_1 = require("../../common/guards/representative-jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let CommissionsController = class CommissionsController {
    commissionsService;
    constructor(commissionsService) {
        this.commissionsService = commissionsService;
    }
    getMyCommissions(req) {
        const representativeId = req.user.id;
        return this.commissionsService.getRepresentativeCommissions(representativeId);
    }
    getMyCommissionStats(req) {
        const representativeId = req.user.id;
        return this.commissionsService.getRepresentativeCommissionStats(representativeId);
    }
    getCommissionsByPeriod(req, startDate, endDate) {
        const representativeId = req.user.id;
        return this.commissionsService.getCommissionsByPeriod(representativeId, startDate, endDate);
    }
    getCommissionDetails(commissionId) {
        return this.commissionsService.getCommissionDetails(commissionId);
    }
    getAllCommissions() {
        return this.commissionsService.getAllCommissions();
    }
    getPendingCommissions() {
        return this.commissionsService.getPendingCommissions();
    }
    markCommissionAsPaid(commissionId, req) {
        const userId = req.user.id;
        return this.commissionsService.markCommissionAsPaid(commissionId, userId);
    }
    async getAdminCommissionStats() {
        return {
            message: 'Estatísticas gerais de comissões - Em desenvolvimento',
            totalCommissions: 0,
            totalValue: 0,
            pendingCommissions: 0,
            paidCommissions: 0,
        };
    }
};
exports.CommissionsController = CommissionsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar comissões do representante logado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de comissões do representante' }),
    (0, common_1.Get)('representative/my-commissions'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "getMyCommissions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter estatísticas de comissões do representante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estatísticas de comissões' }),
    (0, common_1.Get)('representative/stats'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "getMyCommissionStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Buscar comissões por período' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comissões do período especificado' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', description: 'Data inicial (YYYY-MM-DD)', example: '2024-01-01' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', description: 'Data final (YYYY-MM-DD)', example: '2024-12-31' }),
    (0, common_1.Get)('representative/by-period'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "getCommissionsByPeriod", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter detalhes de uma comissão específica' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detalhes da comissão' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Comissão não encontrada' }),
    (0, common_1.Get)('representative/:id'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "getCommissionDetails", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas as comissões (Admin/Operator)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de todas as comissões' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "getAllCommissions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar comissões pendentes (Admin/Operator)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de comissões pendentes' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)('pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "getPendingCommissions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Marcar comissão como paga (Admin/Operator)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comissão marcada como paga com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Comissão não encontrada' }),
    (0, common_1.Post)(':id/mark-paid'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommissionsController.prototype, "markCommissionAsPaid", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter estatísticas gerais de comissões (Admin/Operator)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estatísticas gerais de comissões' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)('admin/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommissionsController.prototype, "getAdminCommissionStats", null);
exports.CommissionsController = CommissionsController = __decorate([
    (0, swagger_1.ApiTags)('Comissões'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('commissions'),
    __metadata("design:paramtypes", [commissions_service_1.CommissionsService])
], CommissionsController);
//# sourceMappingURL=commissions.controller.js.map