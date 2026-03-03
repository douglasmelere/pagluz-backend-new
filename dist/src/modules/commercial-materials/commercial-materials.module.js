"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommercialMaterialsModule = void 0;
const common_1 = require("@nestjs/common");
const commercial_materials_service_1 = require("./commercial-materials.service");
const commercial_materials_controller_1 = require("./commercial-materials.controller");
const prisma_service_1 = require("../../config/prisma.service");
let CommercialMaterialsModule = class CommercialMaterialsModule {
};
exports.CommercialMaterialsModule = CommercialMaterialsModule;
exports.CommercialMaterialsModule = CommercialMaterialsModule = __decorate([
    (0, common_1.Module)({
        controllers: [commercial_materials_controller_1.CommercialMaterialsController],
        providers: [commercial_materials_service_1.CommercialMaterialsService, prisma_service_1.PrismaService],
        exports: [commercial_materials_service_1.CommercialMaterialsService],
    })
], CommercialMaterialsModule);
//# sourceMappingURL=commercial-materials.module.js.map