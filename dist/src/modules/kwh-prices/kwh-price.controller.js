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
exports.KwhPriceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const kwh_price_service_1 = require("./kwh-price.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let KwhPriceController = class KwhPriceController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(body, req) {
        return this.service.create({ ...body, createdByUserId: req.user.id });
    }
    getCurrentPrices() {
        return this.service.getCurrentPrices();
    }
    getConcessionaires() {
        return this.service.getConcessionaires();
    }
    getComparison() {
        return this.service.getPriceComparison();
    }
    getHistory(concessionaire) {
        return this.service.getHistory(decodeURIComponent(concessionaire));
    }
    getPriceAtDate(concessionaire, date) {
        return this.service.getPriceAtDate(concessionaire, date);
    }
    getCurrentPrice(concessionaire) {
        return this.service.getCurrentPrice(decodeURIComponent(concessionaire));
    }
    update(id, body) {
        return this.service.update(id, body);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.KwhPriceController = KwhPriceController;
__decorate([
    (0, common_1.Post)(),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastrar novo preço de kWh (fecha o anterior automaticamente)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], KwhPriceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar preços vigentes de todas as concessionárias' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KwhPriceController.prototype, "getCurrentPrices", null);
__decorate([
    (0, common_1.Get)('concessionaires'),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas as concessionárias cadastradas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KwhPriceController.prototype, "getConcessionaires", null);
__decorate([
    (0, common_1.Get)('comparison'),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Comparativo de preços entre concessionárias' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], KwhPriceController.prototype, "getComparison", null);
__decorate([
    (0, common_1.Get)('history/:concessionaire'),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Histórico de preços de uma concessionária' }),
    __param(0, (0, common_1.Param)('concessionaire')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KwhPriceController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('at-date'),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Preço em uma data específica' }),
    (0, swagger_1.ApiQuery)({ name: 'concessionaire', required: true }),
    (0, swagger_1.ApiQuery)({ name: 'date', required: true, example: '2026-03-01' }),
    __param(0, (0, common_1.Query)('concessionaire')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], KwhPriceController.prototype, "getPriceAtDate", null);
__decorate([
    (0, common_1.Get)(':concessionaire/current'),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('OPERATOR'),
    (0, swagger_1.ApiOperation)({ summary: 'Preço vigente de uma concessionária' }),
    __param(0, (0, common_1.Param)('concessionaire')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KwhPriceController.prototype, "getCurrentPrice", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar registro de preço' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], KwhPriceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('MANAGER'),
    (0, swagger_1.ApiOperation)({ summary: 'Excluir registro de preço' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], KwhPriceController.prototype, "remove", null);
exports.KwhPriceController = KwhPriceController = __decorate([
    (0, swagger_1.ApiTags)('Preços kWh / Tarifas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('kwh-prices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    __metadata("design:paramtypes", [kwh_price_service_1.KwhPriceService])
], KwhPriceController);
//# sourceMappingURL=kwh-price.controller.js.map