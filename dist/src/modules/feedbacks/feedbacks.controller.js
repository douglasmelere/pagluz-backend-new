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
exports.FeedbacksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const feedbacks_service_1 = require("./feedbacks.service");
const create_feedback_dto_1 = require("./dto/create-feedback.dto");
const respond_feedback_dto_1 = require("./dto/respond-feedback.dto");
const update_feedback_status_dto_1 = require("./dto/update-feedback-status.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const representative_jwt_auth_guard_1 = require("../../common/guards/representative-jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let FeedbacksController = class FeedbacksController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(req, dto) {
        return this.service.create(req.user.id, dto);
    }
    findMyFeedbacks(req) {
        return this.service.findByRepresentative(req.user.id);
    }
    countMyFeedbacks(req) {
        return this.service.countByRepresentative(req.user.id);
    }
    findOneMy(id, req) {
        return this.service.findOneByRepresentative(id, req.user.id);
    }
    respondAsRepresentative(id, req, dto) {
        return this.service.respondAsRepresentative(id, req.user.id, req.user.name, dto);
    }
    findAll(status, type, priority, representativeId) {
        return this.service.findAll({ status, type, priority, representativeId });
    }
    getMetrics() {
        return this.service.getMetrics();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    updateStatus(id, req, dto) {
        return this.service.updateStatus(id, dto, req.user.id);
    }
    respondAsAdmin(id, req, dto) {
        return this.service.respondAsAdmin(id, req.user.id, req.user.name, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.FeedbacksController = FeedbacksController;
__decorate([
    (0, common_1.Post)('representative'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Criar feedback (Representante)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Feedback criado com sucesso' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_feedback_dto_1.CreateFeedbackDto]),
    __metadata("design:returntype", void 0)
], FeedbacksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('representative/my-feedbacks'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar meus feedbacks (Representante)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de feedbacks do representante' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FeedbacksController.prototype, "findMyFeedbacks", null);
__decorate([
    (0, common_1.Get)('representative/counts'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Contagem de feedbacks por status (Representante)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contagem de feedbacks' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FeedbacksController.prototype, "countMyFeedbacks", null);
__decorate([
    (0, common_1.Get)('representative/:id'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Ver detalhes de um feedback (Representante)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detalhes do feedback' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FeedbacksController.prototype, "findOneMy", null);
__decorate([
    (0, common_1.Post)('representative/:id/respond'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Responder no thread do feedback (Representante)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Resposta adicionada com sucesso' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, respond_feedback_dto_1.RespondFeedbackDto]),
    __metadata("design:returntype", void 0)
], FeedbacksController.prototype, "respondAsRepresentative", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os feedbacks (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de todos os feedbacks' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['OPEN', 'IN_ANALYSIS', 'RESOLVED', 'REJECTED'] }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, enum: ['COMPLAINT', 'SUGGESTION', 'BUG', 'PRAISE'] }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }),
    (0, swagger_1.ApiQuery)({ name: 'representativeId', required: false }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('priority')),
    __param(3, (0, common_1.Query)('representativeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], FeedbacksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('admin/metrics'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Métricas dos feedbacks (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Métricas globais dos feedbacks' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FeedbacksController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhes de um feedback (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detalhes do feedback com respostas' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeedbacksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('admin/:id/status'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar status/prioridade de um feedback (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status atualizado com sucesso' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_feedback_status_dto_1.UpdateFeedbackStatusDto]),
    __metadata("design:returntype", void 0)
], FeedbacksController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('admin/:id/respond'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Responder feedback (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Resposta do admin adicionada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, respond_feedback_dto_1.RespondFeedbackDto]),
    __metadata("design:returntype", void 0)
], FeedbacksController.prototype, "respondAsAdmin", null);
__decorate([
    (0, common_1.Delete)('admin/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir feedback (Admin - Manager+)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Feedback excluído' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FeedbacksController.prototype, "remove", null);
exports.FeedbacksController = FeedbacksController = __decorate([
    (0, swagger_1.ApiTags)('Feedbacks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('feedbacks'),
    __metadata("design:paramtypes", [feedbacks_service_1.FeedbacksService])
], FeedbacksController);
//# sourceMappingURL=feedbacks.controller.js.map