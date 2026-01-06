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
exports.SettingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const settings_service_1 = require("./settings.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const hierarchy_auth_guard_1 = require("../../common/guards/hierarchy-auth.guard");
let SettingsController = class SettingsController {
    settingsService;
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    getCurrentKwhPrice() {
        return this.settingsService.getCurrentKwhPrice();
    }
    setKwhPrice(body, req) {
        const userId = req.user.id;
        return this.settingsService.setKwhPrice(body.price, userId);
    }
    getKwhPriceHistory() {
        return this.settingsService.getKwhPriceHistory();
    }
    getAllSettings() {
        return this.settingsService.getAllSettings();
    }
    setSetting(body, req) {
        const userId = req.user.id;
        return this.settingsService.setSetting(body.key, body.value, body.description || '', userId);
    }
    getSystemStats() {
        return this.settingsService.getSystemStats();
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter valor atual do kWh' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Valor atual do kWh' }),
    (0, common_1.Get)('kwh-price'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getCurrentKwhPrice", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Definir valor do kWh (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Valor do kWh atualizado com sucesso' }),
    (0, common_1.Post)('kwh-price'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setKwhPrice", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter histórico de alterações do preço do kWh' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Histórico de alterações' }),
    (0, common_1.Get)('kwh-price/history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getKwhPriceHistory", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter todas as configurações do sistema' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de configurações' }),
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getAllSettings", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Definir configuração genérica (Admin)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuração atualizada com sucesso' }),
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "setSetting", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter estatísticas do sistema' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estatísticas do sistema' }),
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, hierarchy_auth_guard_1.HierarchyAuthGuard),
    (0, hierarchy_auth_guard_1.RequireHierarchy)('ADMIN'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SettingsController.prototype, "getSystemStats", null);
exports.SettingsController = SettingsController = __decorate([
    (0, swagger_1.ApiTags)('Configurações do Sistema'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsController);
//# sourceMappingURL=settings.controller.js.map