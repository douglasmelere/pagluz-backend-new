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
exports.ConsumersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const consumers_service_1 = require("./consumers.service");
const consumer_change_requests_service_1 = require("./consumer-change-requests.service");
const create_consumer_dto_1 = require("./dto/create-consumer.dto");
const update_consumer_dto_1 = require("./dto/update-consumer.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const representative_jwt_auth_guard_1 = require("../../common/guards/representative-jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let ConsumersController = class ConsumersController {
    consumersService;
    changeRequestsService;
    constructor(consumersService, changeRequestsService) {
        this.consumersService = consumersService;
        this.changeRequestsService = changeRequestsService;
    }
    create(createConsumerDto) {
        return this.consumersService.create(createConsumerDto);
    }
    createAsRepresentative(createConsumerDto, req) {
        const representativeId = req.user.id;
        return this.consumersService.createAsRepresentative(createConsumerDto, representativeId);
    }
    findMyConsumers(req) {
        const representativeId = req.user.id;
        return this.consumersService.findByRepresentative(representativeId);
    }
    findAll() {
        return this.consumersService.findAll();
    }
    getStatistics() {
        return this.consumersService.getStatistics();
    }
    findPending(state, city, representativeId, startDate, endDate, page, limit) {
        return this.consumersService.findPending({
            state,
            city,
            representativeId,
            startDate,
            endDate,
            page: page || 1,
            limit: limit || 20,
        });
    }
    getByState(state) {
        return this.consumersService.getByState(state);
    }
    findOne(id) {
        return this.consumersService.findOne(id);
    }
    update(id, updateConsumerDto) {
        return this.consumersService.update(id, updateConsumerDto);
    }
    remove(id) {
        return this.consumersService.remove(id);
    }
    allocateToGenerator(consumerId, body) {
        return this.consumersService.allocateToGenerator(consumerId, body.generatorId, body.percentage);
    }
    deallocate(consumerId) {
        return this.consumersService.deallocate(consumerId);
    }
    findRepresentativeConsumersWithFilters(req, status, approvalStatus, consumerType, state, city, startDate, endDate, page, limit) {
        const representativeId = req.user.id;
        return this.consumersService.findRepresentativeConsumersWithFilters(representativeId, {
            status: status,
            approvalStatus: approvalStatus,
            consumerType,
            state,
            city,
            startDate,
            endDate,
            page: page || 1,
            limit: limit || 20,
        });
    }
    findRepresentativeConsumer(req, consumerId) {
        const representativeId = req.user.id;
        return this.consumersService.findRepresentativeConsumer(representativeId, consumerId);
    }
    async updateRepresentativeConsumer(req, consumerId, updateConsumerDto) {
        const representativeId = req.user.id;
        return this.consumersService.updateRepresentativeConsumerWithApproval(consumerId, representativeId, updateConsumerDto);
    }
    getRepresentativeConsumerStats(req) {
        const representativeId = req.user.id;
        return this.consumersService.getRepresentativeConsumerStats(representativeId);
    }
    getConsumerActivityHistory(req, consumerId) {
        const representativeId = req.user.id;
        return this.consumersService.getConsumerActivityHistory(representativeId, consumerId);
    }
    approveConsumer(consumerId, req) {
        const userId = req.user.id;
        return this.consumersService.approveConsumer(consumerId, userId);
    }
    rejectConsumer(consumerId, body, req) {
        const userId = req.user.id;
        return this.consumersService.rejectConsumer(consumerId, userId, body?.reason);
    }
    generateCommissionsForApprovedConsumers() {
        return this.consumersService.generateCommissionsForApprovedConsumers();
    }
    generateCommissionsForApprovedConsumersWithoutAllocation() {
        return this.consumersService.generateCommissionsForApprovedConsumersWithoutAllocation();
    }
    async debugEligibleConsumers() {
        return this.consumersService.debugEligibleConsumers();
    }
    async debugEligibleConsumersPublic() {
        return this.consumersService.debugEligibleConsumers();
    }
    async createTestConsumer() {
        return this.consumersService.createTestConsumer();
    }
    async debugGenerateCommissions() {
        return this.consumersService.generateCommissionsForApprovedConsumersWithoutAllocation();
    }
    async simulateAttachRepresentative() {
        return this.consumersService.createTestConsumer();
    }
    async generateCommissionForConsumer(consumerId) {
        return this.consumersService.generateCommissionForConsumer(consumerId);
    }
    async debugGenerateCommissionForConsumer(consumerId) {
        return this.consumersService.generateCommissionForConsumer(consumerId);
    }
    async debugApproveConsumer(consumerId) {
        return this.consumersService.approveConsumer(consumerId, 'debug-user');
    }
    async uploadInvoice(req, consumerId, file) {
        if (!file) {
            throw new common_1.BadRequestException('Arquivo não fornecido');
        }
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/pdf',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Tipo de arquivo não permitido. Use PDF ou imagem (JPG, PNG, WEBP)');
        }
        const representativeId = req.user.id;
        return this.consumersService.uploadInvoice(consumerId, representativeId, file);
    }
    async removeInvoice(req, consumerId) {
        const representativeId = req.user.id;
        return this.consumersService.removeInvoice(consumerId, representativeId);
    }
    async downloadInvoice(req, consumerId, res) {
        const representativeId = req.user.id;
        return this.consumersService.downloadInvoice(consumerId, representativeId, res);
    }
    async downloadInvoiceAdmin(consumerId, res) {
        return this.consumersService.downloadInvoiceAdmin(consumerId, res);
    }
    getPendingChangeRequests(page, limit) {
        return this.changeRequestsService.getPendingRequests(page || 1, limit || 10);
    }
    getRepresentativeChangeRequests(req) {
        const representativeId = req.user.id;
        return this.changeRequestsService.getRepresentativeRequests(representativeId);
    }
    approveChangeRequest(req, changeRequestId) {
        const adminUserId = req.user.id;
        return this.changeRequestsService.approveChangeRequest(changeRequestId, adminUserId);
    }
    rejectChangeRequest(req, changeRequestId, body) {
        const adminUserId = req.user.id;
        if (!body.rejectionReason) {
            throw new common_1.BadRequestException('Motivo da rejeição é obrigatório');
        }
        return this.changeRequestsService.rejectChangeRequest(changeRequestId, adminUserId, body.rejectionReason);
    }
};
exports.ConsumersController = ConsumersController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo consumidor' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Consumidor criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'CPF/CNPJ já está cadastrado' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_consumer_dto_1.CreateConsumerDto]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo consumidor (Representante)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Consumidor criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'CPF/CNPJ já está cadastrado' }),
    (0, common_1.Post)('representative'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_consumer_dto_1.CreateConsumerDto, Object]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "createAsRepresentative", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar consumidores do representante logado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de consumidores do representante' }),
    (0, common_1.Get)('representative/my-consumers'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "findMyConsumers", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os consumidores' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de consumidores' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter estatísticas dos consumidores' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estatísticas dos consumidores' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "getStatistics", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar consumidores pendentes de aprovação (Admin/Operator)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de consumidores pendentes' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Query)('state')),
    __param(1, (0, common_1.Query)('city')),
    __param(2, (0, common_1.Query)('representativeId')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "findPending", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Buscar consumidores por estado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consumidores do estado' }),
    (0, swagger_1.ApiQuery)({ name: 'state', description: 'UF do estado', example: 'SC' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)('by-state'),
    __param(0, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "getByState", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Buscar consumidor por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consumidor encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Consumidor não encontrado' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar consumidor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consumidor atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Consumidor não encontrado' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_consumer_dto_1.UpdateConsumerDto]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Remover consumidor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consumidor removido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Consumidor não encontrado' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "remove", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Alocar consumidor a um gerador' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consumidor alocado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Consumidor ou gerador não encontrado' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Post)(':id/allocate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "allocateToGenerator", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Desalocar consumidor de um gerador' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consumidor desalocado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Consumidor não encontrado' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Post)(':id/deallocate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "deallocate", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar consumidores do representante com filtros' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de consumidores com filtros aplicados' }),
    (0, common_1.Get)('representative/filtered'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('approvalStatus')),
    __param(3, (0, common_1.Query)('consumerType')),
    __param(4, (0, common_1.Query)('state')),
    __param(5, (0, common_1.Query)('city')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __param(8, (0, common_1.Query)('page')),
    __param(9, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "findRepresentativeConsumersWithFilters", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter consumidor específico do representante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detalhes do consumidor' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Consumidor não encontrado' }),
    (0, common_1.Get)('representative/:id'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "findRepresentativeConsumer", null);
__decorate([
    (0, swagger_1.ApiOperation)({
        summary: 'Atualizar consumidor (Representante)',
        description: 'Campos críticos (kWh, desconto, UC, concessionária, tipo, fase) requerem aprovação. Campos não críticos (contato, endereço, observações) são atualizados diretamente.'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Consumidor atualizado. Campos críticos aguardam aprovação se houver.',
        schema: {
            type: 'object',
            properties: {
                consumer: { type: 'object' },
                changeRequest: { type: 'object', nullable: true },
                message: { type: 'string' },
                updatedFields: {
                    type: 'object',
                    properties: {
                        direct: { type: 'array', items: { type: 'string' } },
                        pending: { type: 'array', items: { type: 'string' } },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Consumidor não encontrado' }),
    (0, common_1.Patch)('representative/:id'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_consumer_dto_1.UpdateConsumerDto]),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "updateRepresentativeConsumer", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter estatísticas dos consumidores do representante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estatísticas detalhadas dos consumidores' }),
    (0, common_1.Get)('representative/stats/overview'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "getRepresentativeConsumerStats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter histórico de atividades de um consumidor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Histórico completo de atividades do consumidor' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Consumidor não encontrado' }),
    (0, common_1.Get)('representative/:id/activity-history'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "getConsumerActivityHistory", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Aprovar consumidor (Admin/Operator)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consumidor aprovado com sucesso' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "approveConsumer", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Rejeitar consumidor (Admin/Operator)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consumidor rejeitado com sucesso' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "rejectConsumer", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Gerar comissões para consumidores aprovados e alocados sem comissão (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comissões geradas com sucesso' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Post)('generate-commissions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "generateCommissionsForApprovedConsumers", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Gerar comissões para consumidores aprovados sem comissão (mesmo sem alocação) (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comissões geradas com sucesso' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Post)('generate-commissions-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "generateCommissionsForApprovedConsumersWithoutAllocation", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Debug: Verificar consumidores elegíveis para comissão (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de consumidores elegíveis' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Get)('debug/eligible-consumers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "debugEligibleConsumers", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Debug: Verificar consumidores elegíveis para comissão (SEM AUTENTICAÇÃO - APENAS PARA DEBUG)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de consumidores elegíveis' }),
    (0, common_1.Get)('debug/eligible-consumers-public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "debugEligibleConsumersPublic", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Debug: Criar consumidor de teste (SEM AUTENTICAÇÃO - APENAS PARA DEBUG)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consumidor de teste criado' }),
    (0, common_1.Post)('debug/create-test-consumer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "createTestConsumer", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Debug: Gerar comissões (SEM AUTENTICAÇÃO - APENAS PARA DEBUG)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comissões geradas' }),
    (0, common_1.Post)('debug/generate-commissions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "debugGenerateCommissions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Debug: Simular anexação de representante e gerar comissão' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Representante anexado e comissão gerada' }),
    (0, common_1.Post)('debug/simulate-attach-representative'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "simulateAttachRepresentative", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Gerar comissão para um consumidor específico (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comissão gerada com sucesso' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Post)(':id/generate-commission'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "generateCommissionForConsumer", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Debug: Gerar comissão para um consumidor específico (SEM AUTENTICAÇÃO)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Comissão gerada com sucesso' }),
    (0, common_1.Post)('debug/:id/generate-commission'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "debugGenerateCommissionForConsumer", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Debug: Aprovar consumidor (SEM AUTENTICAÇÃO)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consumidor aprovado' }),
    (0, common_1.Post)('debug/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "debugApproveConsumer", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Upload de fatura para consumidor (Representante)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fatura enviada com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Consumidor não encontrado' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo da fatura (PDF ou imagem)',
                },
            },
        },
    }),
    (0, common_1.Post)('representative/:id/invoice'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "uploadInvoice", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Remover fatura de consumidor (Representante)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Fatura removida com sucesso' }),
    (0, common_1.Delete)('representative/:id/invoice'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "removeInvoice", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Download de fatura (Representante)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Arquivo da fatura' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Fatura não encontrada' }),
    (0, common_1.Get)('representative/:id/invoice'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "downloadInvoice", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Download de fatura (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Arquivo da fatura' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Fatura não encontrada' }),
    (0, common_1.Get)(':id/invoice'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConsumersController.prototype, "downloadInvoiceAdmin", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar solicitações de mudança pendentes (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de solicitações pendentes' }),
    (0, common_1.Get)('change-requests/pending'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "getPendingChangeRequests", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar solicitações de mudança do representante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de solicitações do representante' }),
    (0, common_1.Get)('representative/change-requests'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "getRepresentativeChangeRequests", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Aprovar solicitação de mudança (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mudança aprovada e aplicada' }),
    (0, common_1.Post)('change-requests/:id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "approveChangeRequest", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Rejeitar solicitação de mudança (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mudança rejeitada' }),
    (0, common_1.Post)('change-requests/:id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "rejectChangeRequest", null);
exports.ConsumersController = ConsumersController = __decorate([
    (0, swagger_1.ApiTags)('Consumidores'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('consumers'),
    __metadata("design:paramtypes", [consumers_service_1.ConsumersService,
        consumer_change_requests_service_1.ConsumerChangeRequestsService])
], ConsumersController);
//# sourceMappingURL=consumers.controller.js.map