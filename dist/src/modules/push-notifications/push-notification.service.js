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
exports.PushNotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let PushNotificationService = class PushNotificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async registerToken(representativeId, data) {
        return this.prisma.pushToken.upsert({
            where: { token: data.token },
            update: {
                representativeId,
                platform: data.platform,
                deviceName: data.deviceName ?? null,
                isActive: true,
                updatedAt: new Date(),
            },
            create: {
                representativeId,
                token: data.token,
                platform: data.platform,
                deviceName: data.deviceName ?? null,
            },
        });
    }
    async removeToken(token) {
        const existing = await this.prisma.pushToken.findUnique({ where: { token } });
        if (!existing)
            throw new common_1.NotFoundException('Token não encontrado');
        return this.prisma.pushToken.delete({ where: { token } });
    }
    async deactivateToken(token) {
        return this.prisma.pushToken.update({
            where: { token },
            data: { isActive: false },
        });
    }
    async getTokens(representativeId) {
        return this.prisma.pushToken.findMany({
            where: { representativeId, isActive: true },
        });
    }
    async sendToRepresentative(representativeId, notification) {
        const tokens = await this.getTokens(representativeId);
        if (tokens.length === 0) {
            return { sent: false, reason: 'Nenhum token registrado', tokens: 0 };
        }
        return {
            sent: true,
            tokens: tokens.length,
            notification,
            message: 'Notificação enfileirada. Integre com FCM para envio real.',
        };
    }
    async sendToAll(notification) {
        const allTokens = await this.prisma.pushToken.findMany({
            where: { isActive: true },
            select: { token: true, representativeId: true },
        });
        return {
            sent: true,
            totalTokens: allTokens.length,
            uniqueRepresentatives: new Set(allTokens.map(t => t.representativeId)).size,
            notification,
            message: 'Notificação em massa enfileirada. Integre com FCM para envio real.',
        };
    }
    async getTokenStats() {
        const [total, active, byPlatform] = await Promise.all([
            this.prisma.pushToken.count(),
            this.prisma.pushToken.count({ where: { isActive: true } }),
            this.prisma.pushToken.groupBy({
                by: ['platform'],
                where: { isActive: true },
                _count: { id: true },
            }),
        ]);
        return {
            total,
            active,
            inactive: total - active,
            byPlatform: byPlatform.map(p => ({ platform: p.platform, count: p._count.id })),
        };
    }
};
exports.PushNotificationService = PushNotificationService;
exports.PushNotificationService = PushNotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PushNotificationService);
//# sourceMappingURL=push-notification.service.js.map