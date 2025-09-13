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
const swagger_1 = require("@nestjs/swagger");
const consumers_service_1 = require("./consumers.service");
const create_consumer_dto_1 = require("./dto/create-consumer.dto");
const update_consumer_dto_1 = require("./dto/update-consumer.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const representative_auth_guard_1 = require("../../common/guards/representative-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let ConsumersController = class ConsumersController {
    consumersService;
    constructor(consumersService) {
        this.consumersService = consumersService;
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
};
exports.ConsumersController = ConsumersController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo consumidor' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Consumidor criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'CPF/CNPJ já está cadastrado' }),
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
    (0, common_1.UseGuards)(representative_auth_guard_1.RepresentativeAuthGuard),
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
    (0, common_1.UseGuards)(representative_auth_guard_1.RepresentativeAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "findMyConsumers", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os consumidores' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de consumidores' }),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter estatísticas dos consumidores' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estatísticas dos consumidores' }),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "getStatistics", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Buscar consumidores por estado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Consumidores do estado' }),
    (0, swagger_1.ApiQuery)({ name: 'state', description: 'UF do estado', example: 'SC' }),
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
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Post)(':id/deallocate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConsumersController.prototype, "deallocate", null);
exports.ConsumersController = ConsumersController = __decorate([
    (0, swagger_1.ApiTags)('Consumidores'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, common_1.Controller)('consumers'),
    __metadata("design:paramtypes", [consumers_service_1.ConsumersService])
], ConsumersController);
//# sourceMappingURL=consumers.controller.js.map