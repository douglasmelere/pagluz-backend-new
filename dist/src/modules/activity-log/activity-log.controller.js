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
exports.ActivityLogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const activity_log_service_1 = require("./activity-log.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const representative_jwt_auth_guard_1 = require("../../common/guards/representative-jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let ActivityLogController = class ActivityLogController {
    service;
    constructor(service) {
        this.service = service;
    }
    getMyTimeline(req, limit) {
        return this.service.getRepresentativeTimeline(req.user.id, limit ? parseInt(limit) : 50);
    }
    getGlobalTimeline(entityType, action, representativeId, startDate, endDate, limit) {
        return this.service.getGlobalTimeline({
            entityType, action, representativeId, startDate, endDate,
            limit: limit ? parseInt(limit) : 100,
        });
    }
    getEntityTimeline(entityType, entityId) {
        return this.service.getEntityTimeline(entityType, entityId);
    }
    getStats(days) {
        return this.service.getActivityStats(days ? parseInt(days) : 30);
    }
};
exports.ActivityLogController = ActivityLogController;
__decorate([
    (0, common_1.Get)('representative/my-timeline'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Minha timeline de atividades (Representante)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 50 }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ActivityLogController.prototype, "getMyTimeline", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Timeline global de atividades (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', required: false, example: 'Consumer' }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, example: 'CREATED' }),
    (0, swagger_1.ApiQuery)({ name: 'representativeId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 100 }),
    __param(0, (0, common_1.Query)('entityType')),
    __param(1, (0, common_1.Query)('action')),
    __param(2, (0, common_1.Query)('representativeId')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ActivityLogController.prototype, "getGlobalTimeline", null);
__decorate([
    (0, common_1.Get)('admin/entity/:entityType/:entityId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Timeline de uma entidade específica (Admin)' }),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ActivityLogController.prototype, "getEntityTimeline", null);
__decorate([
    (0, common_1.Get)('admin/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Estatísticas de atividade (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false, example: 30 }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ActivityLogController.prototype, "getStats", null);
exports.ActivityLogController = ActivityLogController = __decorate([
    (0, swagger_1.ApiTags)('Activity Log / Timeline'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('activity-log'),
    __metadata("design:paramtypes", [activity_log_service_1.ActivityLogService])
], ActivityLogController);
//# sourceMappingURL=activity-log.controller.js.map