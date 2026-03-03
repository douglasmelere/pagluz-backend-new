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
exports.RepresentativeDashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const representative_dashboard_service_1 = require("./representative-dashboard.service");
const representative_auth_guard_1 = require("../../common/guards/representative-auth.guard");
let RepresentativeDashboardController = class RepresentativeDashboardController {
    representativeDashboardService;
    constructor(representativeDashboardService) {
        this.representativeDashboardService = representativeDashboardService;
    }
    getDashboard(req) {
        return this.representativeDashboardService.getRepresentativeDashboard(req.user.id);
    }
    getCommercialMaterials() {
        return this.representativeDashboardService.getCommercialMaterials();
    }
};
exports.RepresentativeDashboardController = RepresentativeDashboardController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter dashboard completo do representante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard do representante' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(representative_auth_guard_1.RepresentativeAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RepresentativeDashboardController.prototype, "getDashboard", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Obter materiais comerciais' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de materiais comerciais' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(representative_auth_guard_1.RepresentativeAuthGuard),
    (0, common_1.Get)('materials'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RepresentativeDashboardController.prototype, "getCommercialMaterials", null);
exports.RepresentativeDashboardController = RepresentativeDashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard do Representante'),
    (0, common_1.Controller)('representative-dashboard'),
    __metadata("design:paramtypes", [representative_dashboard_service_1.RepresentativeDashboardService])
], RepresentativeDashboardController);
//# sourceMappingURL=representative-dashboard.controller.js.map