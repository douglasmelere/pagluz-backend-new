"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedDashboardModule = void 0;
const common_1 = require("@nestjs/common");
const advanced_dashboard_service_1 = require("./advanced-dashboard.service");
const advanced_dashboard_controller_1 = require("./advanced-dashboard.controller");
const prisma_service_1 = require("../../config/prisma.service");
let AdvancedDashboardModule = class AdvancedDashboardModule {
};
exports.AdvancedDashboardModule = AdvancedDashboardModule;
exports.AdvancedDashboardModule = AdvancedDashboardModule = __decorate([
    (0, common_1.Module)({
        controllers: [advanced_dashboard_controller_1.AdvancedDashboardController],
        providers: [advanced_dashboard_service_1.AdvancedDashboardService, prisma_service_1.PrismaService],
        exports: [advanced_dashboard_service_1.AdvancedDashboardService],
    })
], AdvancedDashboardModule);
//# sourceMappingURL=advanced-dashboard.module.js.map