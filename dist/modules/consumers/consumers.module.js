"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsumersModule = void 0;
const common_1 = require("@nestjs/common");
const consumers_service_1 = require("./consumers.service");
const consumers_controller_1 = require("./consumers.controller");
const prisma_service_1 = require("../../config/prisma.service");
let ConsumersModule = class ConsumersModule {
};
exports.ConsumersModule = ConsumersModule;
exports.ConsumersModule = ConsumersModule = __decorate([
    (0, common_1.Module)({
        controllers: [consumers_controller_1.ConsumersController],
        providers: [consumers_service_1.ConsumersService, prisma_service_1.PrismaService],
        exports: [consumers_service_1.ConsumersService],
    })
], ConsumersModule);
//# sourceMappingURL=consumers.module.js.map