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
exports.GeneratorsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const generators_service_1 = require("./generators.service");
const create_generator_dto_1 = require("./dto/create-generator.dto");
const update_generator_dto_1 = require("./dto/update-generator.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let GeneratorsController = class GeneratorsController {
    generatorsService;
    constructor(generatorsService) {
        this.generatorsService = generatorsService;
    }
    create(createGeneratorDto) {
        return this.generatorsService.create(createGeneratorDto);
    }
    findAll() {
        return this.generatorsService.findAll();
    }
    getStatistics() {
        return this.generatorsService.getStatistics();
    }
    getByState(state) {
        return this.generatorsService.getByState(state);
    }
    getBySourceType(sourceType) {
        return this.generatorsService.getBySourceType(sourceType);
    }
    findOne(id) {
        return this.generatorsService.findOne(id);
    }
    update(id, updateGeneratorDto) {
        return this.generatorsService.update(id, updateGeneratorDto);
    }
    remove(id) {
        return this.generatorsService.remove(id);
    }
};
exports.GeneratorsController = GeneratorsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo gerador' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Gerador criado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'CPF/CNPJ já está cadastrado' }),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_generator_dto_1.CreateGeneratorDto]),
    __metadata("design:returntype", void 0)
], GeneratorsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os geradores' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de geradores' }),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GeneratorsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter estatísticas dos geradores' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estatísticas dos geradores' }),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GeneratorsController.prototype, "getStatistics", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Buscar geradores por estado' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Geradores do estado' }),
    (0, swagger_1.ApiQuery)({ name: 'state', description: 'UF do estado', example: 'SC' }),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)('by-state'),
    __param(0, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GeneratorsController.prototype, "getByState", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Buscar geradores por tipo de fonte' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Geradores do tipo de fonte' }),
    (0, swagger_1.ApiQuery)({
        name: 'sourceType',
        description: 'Tipo de fonte de energia',
        example: 'SOLAR',
        enum: ['SOLAR', 'HYDRO', 'BIOMASS', 'WIND']
    }),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)('by-source-type'),
    __param(0, (0, common_1.Query)('sourceType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GeneratorsController.prototype, "getBySourceType", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Buscar gerador por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Gerador encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Gerador não encontrado' }),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GeneratorsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar gerador' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Gerador atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Gerador não encontrado' }),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_generator_dto_1.UpdateGeneratorDto]),
    __metadata("design:returntype", void 0)
], GeneratorsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Remover gerador' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Gerador removido com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Gerador não encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Gerador possui consumidores alocados' }),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GeneratorsController.prototype, "remove", null);
exports.GeneratorsController = GeneratorsController = __decorate([
    (0, swagger_1.ApiTags)('Geradores'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, common_1.Controller)('generators'),
    __metadata("design:paramtypes", [generators_service_1.GeneratorsService])
], GeneratorsController);
//# sourceMappingURL=generators.controller.js.map