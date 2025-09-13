"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./modules/users/users.module");
const consumers_module_1 = require("./modules/consumers/consumers.module");
const generators_module_1 = require("./modules/generators/generators.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const representatives_module_1 = require("./modules/representatives/representatives.module");
const auth_module_1 = require("./modules/auth/auth.module");
const audit_module_1 = require("./modules/audit/audit.module");
const prisma_service_1 = require("./config/prisma.service");
const audit_service_1 = require("./common/services/audit.service");
const logout_service_1 = require("./common/services/logout.service");
const hierarchy_auth_guard_1 = require("./common/guards/hierarchy-auth.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            users_module_1.UsersModule,
            consumers_module_1.ConsumersModule,
            generators_module_1.GeneratorsModule,
            dashboard_module_1.DashboardModule,
            representatives_module_1.RepresentativesModule,
            auth_module_1.AuthModule,
            audit_module_1.AuditModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            prisma_service_1.PrismaService,
            audit_service_1.AuditService,
            logout_service_1.LogoutService,
            hierarchy_auth_guard_1.HierarchyAuthGuard,
        ],
        exports: [audit_service_1.AuditService, logout_service_1.LogoutService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map