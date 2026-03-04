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
exports.RankingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ranking_service_1 = require("./ranking.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const representative_jwt_auth_guard_1 = require("../../common/guards/representative-jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let RankingController = class RankingController {
    service;
    constructor(service) {
        this.service = service;
    }
    getLeaderboard(period) {
        return this.service.getRanking(period);
    }
    getMyBadges(req) {
        return this.service.getBadges(req.user.id);
    }
    checkMyBadges(req) {
        return this.service.checkAndAwardBadges(req.user.id);
    }
    getMyGoals(req) {
        return this.service.getGoals(req.user.id);
    }
    getAdminLeaderboard(period) {
        return this.service.getRanking(period);
    }
    getAllGoals(representativeId, status) {
        return this.service.getAllGoals({ representativeId, status });
    }
    createGoal(body, req) {
        return this.service.createGoal({ ...body, createdByUserId: req.user.id });
    }
    updateGoalProgress(id, body) {
        return this.service.updateGoalProgress(id, body.currentValue);
    }
    checkBadges(id) {
        return this.service.checkAndAwardBadges(id);
    }
};
exports.RankingController = RankingController;
__decorate([
    (0, common_1.Get)('leaderboard'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Ranking dos representantes (Representante)' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['month', 'quarter', 'year', 'all'] }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RankingController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('my-badges'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Minhas conquistas/badges (Representante)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RankingController.prototype, "getMyBadges", null);
__decorate([
    (0, common_1.Post)('check-badges'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar e ganhar novas conquistas (Representante)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RankingController.prototype, "checkMyBadges", null);
__decorate([
    (0, common_1.Get)('my-goals'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Minhas metas (Representante)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RankingController.prototype, "getMyGoals", null);
__decorate([
    (0, common_1.Get)('admin/leaderboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Ranking completo (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'period', required: false, enum: ['month', 'quarter', 'year', 'all'] }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RankingController.prototype, "getAdminLeaderboard", null);
__decorate([
    (0, common_1.Get)('admin/goals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Todas as metas (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'representativeId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['IN_PROGRESS', 'ACHIEVED', 'FAILED', 'CANCELLED'] }),
    __param(0, (0, common_1.Query)('representativeId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RankingController.prototype, "getAllGoals", null);
__decorate([
    (0, common_1.Post)('admin/goals'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar meta para representante (Admin)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RankingController.prototype, "createGoal", null);
__decorate([
    (0, common_1.Patch)('admin/goals/:id/progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar progresso de meta (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RankingController.prototype, "updateGoalProgress", null);
__decorate([
    (0, common_1.Post)('admin/check-badges/:representativeId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar badges de um representante (Admin)' }),
    __param(0, (0, common_1.Param)('representativeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RankingController.prototype, "checkBadges", null);
exports.RankingController = RankingController = __decorate([
    (0, swagger_1.ApiTags)('Ranking & Gamificação'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ranking'),
    __metadata("design:paramtypes", [ranking_service_1.RankingService])
], RankingController);
//# sourceMappingURL=ranking.controller.js.map