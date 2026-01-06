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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const audit_service_1 = require("../../common/services/audit.service");
let SettingsService = class SettingsService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async getCurrentKwhPrice() {
        const setting = await this.prisma.systemSettings.findFirst({
            where: {
                key: 'KWH_PRICE',
                isActive: true,
            },
        });
        if (!setting) {
            return 0.90;
        }
        return parseFloat(setting.value);
    }
    async setKwhPrice(price, userId) {
        if (price <= 0) {
            throw new common_1.BadRequestException('O preço do kWh deve ser maior que zero');
        }
        const existingSetting = await this.prisma.systemSettings.findFirst({
            where: {
                key: 'KWH_PRICE',
                isActive: true,
            },
        });
        let setting;
        if (existingSetting) {
            setting = await this.prisma.systemSettings.update({
                where: { id: existingSetting.id },
                data: {
                    value: price.toString(),
                    updatedAt: new Date(),
                },
            });
        }
        else {
            setting = await this.prisma.systemSettings.create({
                data: {
                    key: 'KWH_PRICE',
                    value: price.toString(),
                    description: 'Preço do kWh para cálculo de comissões',
                    isActive: true,
                },
            });
        }
        await this.auditService.log({
            userId,
            action: 'SETTINGS_UPDATE',
            entityType: 'SystemSettings',
            entityId: setting.id,
            newValues: {
                key: 'KWH_PRICE',
                value: price.toString(),
                description: 'Preço do kWh atualizado',
            },
        });
        return {
            id: setting.id,
            key: setting.key,
            value: parseFloat(setting.value),
            description: setting.description,
            updatedAt: setting.updatedAt,
        };
    }
    async getKwhPriceHistory() {
        const settings = await this.prisma.systemSettings.findMany({
            where: {
                key: 'KWH_PRICE',
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        return settings.map(setting => ({
            id: setting.id,
            value: parseFloat(setting.value),
            isActive: setting.isActive,
            createdAt: setting.createdAt,
            updatedAt: setting.updatedAt,
        }));
    }
    async getAllSettings() {
        const settings = await this.prisma.systemSettings.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                key: 'asc',
            },
        });
        return settings.map(setting => ({
            id: setting.id,
            key: setting.key,
            value: setting.value,
            description: setting.description,
            createdAt: setting.createdAt,
            updatedAt: setting.updatedAt,
        }));
    }
    async setSetting(key, value, description, userId) {
        if (!key || !value) {
            throw new common_1.BadRequestException('Chave e valor são obrigatórios');
        }
        const existingSetting = await this.prisma.systemSettings.findFirst({
            where: {
                key,
                isActive: true,
            },
        });
        let setting;
        if (existingSetting) {
            setting = await this.prisma.systemSettings.update({
                where: { id: existingSetting.id },
                data: {
                    value,
                    description,
                    updatedAt: new Date(),
                },
            });
        }
        else {
            setting = await this.prisma.systemSettings.create({
                data: {
                    key,
                    value,
                    description,
                    isActive: true,
                },
            });
        }
        await this.auditService.log({
            userId,
            action: 'SETTINGS_UPDATE',
            entityType: 'SystemSettings',
            entityId: setting.id,
            newValues: {
                key,
                value,
                description,
            },
        });
        return {
            id: setting.id,
            key: setting.key,
            value: setting.value,
            description: setting.description,
            updatedAt: setting.updatedAt,
        };
    }
    async getSystemStats() {
        const totalConsumers = await this.prisma.consumer.count();
        const totalRepresentatives = await this.prisma.representative.count();
        const totalCommissions = await this.prisma.commission.count();
        const totalCommissionsValue = await this.prisma.commission.aggregate({
            _sum: {
                commissionValue: true,
            },
        });
        const currentKwhPrice = await this.getCurrentKwhPrice();
        return {
            totalConsumers,
            totalRepresentatives,
            totalCommissions,
            totalCommissionsValue: totalCommissionsValue._sum.commissionValue || 0,
            currentKwhPrice,
            lastUpdated: new Date(),
        };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], SettingsService);
//# sourceMappingURL=settings.service.js.map