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
exports.CommercialMaterialsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const commercial_materials_service_1 = require("./commercial-materials.service");
const create_commercial_material_dto_1 = require("./dto/create-commercial-material.dto");
const update_commercial_material_dto_1 = require("./dto/update-commercial-material.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const representative_jwt_auth_guard_1 = require("../../common/guards/representative-jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let CommercialMaterialsController = class CommercialMaterialsController {
    service;
    constructor(service) {
        this.service = service;
    }
    findForRepresentative() {
        return this.service.findAll(true);
    }
    getDownloadUrlForRepresentative(id) {
        return this.service.getDownloadUrl(id);
    }
    create(file, dto) {
        return this.service.create(file, dto);
    }
    findAll(onlyActive) {
        return this.service.findAll(onlyActive === 'true');
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    getDownloadUrl(id) {
        return this.service.getDownloadUrl(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.CommercialMaterialsController = CommercialMaterialsController;
__decorate([
    (0, common_1.Get)('representative'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar materiais comerciais disponíveis (Representante)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommercialMaterialsController.prototype, "findForRepresentative", null);
__decorate([
    (0, common_1.Get)('representative/:id/download-url'),
    (0, common_1.UseGuards)(representative_jwt_auth_guard_1.RepresentativeJwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obter URL de download assinada do material (Representante)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialMaterialsController.prototype, "getDownloadUrlForRepresentative", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar novo material comercial (Admin)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['file', 'title'],
            properties: {
                file: { type: 'string', format: 'binary', description: 'Arquivo (PDF, PPT, imagem, etc.)' },
                title: { type: 'string' },
                description: { type: 'string' },
                category: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_commercial_material_dto_1.CreateCommercialMaterialDto]),
    __metadata("design:returntype", void 0)
], CommercialMaterialsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os materiais comerciais (Admin)' }),
    (0, swagger_1.ApiQuery)({ name: 'onlyActive', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)('onlyActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialMaterialsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Detalhes de um material comercial (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialMaterialsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/download-url'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter URL de download assinada (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialMaterialsController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar metadados de um material (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_commercial_material_dto_1.UpdateCommercialMaterialDto]),
    __metadata("design:returntype", void 0)
], CommercialMaterialsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir material comercial (Admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommercialMaterialsController.prototype, "remove", null);
exports.CommercialMaterialsController = CommercialMaterialsController = __decorate([
    (0, swagger_1.ApiTags)('Commercial Materials'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('commercial-materials'),
    __metadata("design:paramtypes", [commercial_materials_service_1.CommercialMaterialsService])
], CommercialMaterialsController);
//# sourceMappingURL=commercial-materials.controller.js.map