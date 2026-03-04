"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KwhPriceModule = void 0;
const common_1 = require("@nestjs/common");
const kwh_price_service_1 = require("./kwh-price.service");
const kwh_price_controller_1 = require("./kwh-price.controller");
const prisma_service_1 = require("../../config/prisma.service");
let KwhPriceModule = class KwhPriceModule {
};
exports.KwhPriceModule = KwhPriceModule;
exports.KwhPriceModule = KwhPriceModule = __decorate([
    (0, common_1.Module)({
        controllers: [kwh_price_controller_1.KwhPriceController],
        providers: [kwh_price_service_1.KwhPriceService, prisma_service_1.PrismaService],
        exports: [kwh_price_service_1.KwhPriceService],
    })
], KwhPriceModule);
//# sourceMappingURL=kwh-price.module.js.map