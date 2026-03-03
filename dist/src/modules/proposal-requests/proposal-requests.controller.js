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
exports.ProposalRequestsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const proposal_requests_service_1 = require("./proposal-requests.service");
const create_proposal_request_dto_1 = require("./dto/create-proposal-request.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const representative_jwt_auth_guard_1 = require("../../common/guards/representative-jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let ProposalRequestsController = class ProposalRequestsController {
    proposalRequestsService;
    constructor(proposalRequestsService) {
        this.proposalRequestsService = proposalRequestsService;
    }
    create(req, dto) {
        const representativeId = req.user.id;
        return this.proposalRequestsService.create(representativeId, dto);
    }
    findMyRequests(req) {
        const representativeId = req.user.id;
        return this.proposalRequestsService.findByRepresentative(representativeId);
    }
    downloadMyDocument(req, id, res) {
        const representativeId = req.user.id;
        return this.proposalRequestsService.downloadDocument(id, res, representativeId);
    }
    findAll() {
        return this.proposalRequestsService.findAll();
    }
    markAsGenerated(id, file) {
        return this.proposalRequestsService.markAsGenerated(id, file);
    }
    downloadDocumentAdmin(id, res) {
        return this.proposalRequestsService.downloadDocument(id, res);
    }
    delete(id) {
        return this.proposalRequestsService.delete(id);
    }
};
exports.ProposalRequestsController = ProposalRequestsController;
__decorate([
    (0, common_1.Post)('representative'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Solicitar nova proposta (Representante)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_proposal_request_dto_1.CreateProposalRequestDto]),
    __metadata("design:returntype", void 0)
], ProposalRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('representative/my-requests'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar minhas solicitações de proposta (Representante)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProposalRequestsController.prototype, "findMyRequests", null);
__decorate([
    (0, common_1.Get)('representative/:id/document'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Baixar arquivo da proposta gerada (Representante)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ProposalRequestsController.prototype, "downloadMyDocument", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas as solicitações de proposta (Admin)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProposalRequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/generate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar proposta como gerada e anexar arquivo(opcional) (Admin)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo PDF ou imagem da proposta (Opcional)',
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProposalRequestsController.prototype, "markAsGenerated", null);
__decorate([
    (0, common_1.Get)(':id/document'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Baixar arquivo da proposta gerada (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProposalRequestsController.prototype, "downloadDocumentAdmin", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir solicitação de proposta (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProposalRequestsController.prototype, "delete", null);
exports.ProposalRequestsController = ProposalRequestsController = __decorate([
    (0, swagger_1.ApiTags)('Proposal Requests'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('proposal-requests'),
    __metadata("design:paramtypes", [proposal_requests_service_1.ProposalRequestsService])
], ProposalRequestsController);
//# sourceMappingURL=proposal-requests.controller.js.map