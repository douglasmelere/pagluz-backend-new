"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepresentativesModule = void 0;
const common_1 = require("@nestjs/common");
const representatives_service_1 = require("./representatives.service");
const representatives_controller_1 = require("./representatives.controller");
const prisma_service_1 = require("../../config/prisma.service");
const auth_module_1 = require("../auth/auth.module");
let RepresentativesModule = class RepresentativesModule {
};
exports.RepresentativesModule = RepresentativesModule;
exports.RepresentativesModule = RepresentativesModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [representatives_controller_1.RepresentativesController],
        providers: [representatives_service_1.RepresentativesService, prisma_service_1.PrismaService],
        exports: [representatives_service_1.RepresentativesService],
    })
], RepresentativesModule);
//# sourceMappingURL=representatives.module.js.map