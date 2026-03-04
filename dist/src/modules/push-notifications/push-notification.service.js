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
const admin = require("firebase-admin");
let PushNotificationService = class PushNotificationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
        try {
            if (admin.apps.length === 0) {
                const projectId = process.env.FIREBASE_PROJECT_ID;
                const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
                let privateKey = process.env.FIREBASE_PRIVATE_KEY;
                if (privateKey) {
                    if (privateKey.startsWith('LS0t')) {
                        privateKey = Buffer.from(privateKey, 'base64').toString('ascii');
                    }
                    else {
                        privateKey = privateKey
                            .replace(/\\n/g, '\n')
                            .replace(/"/g, '')
                            .replace(/'/g, '')
                            .trim();
                    }
                }
                if (projectId && clientEmail && privateKey) {
                    admin.initializeApp({
                        credential: admin.credential.cert({
                            projectId,
                            clientEmail,
                            privateKey,
                        }),
                    });
                    console.log('✅ Firebase Admin SDK inicializado');
                }
                else {
                    console.warn('⚠️ Firebase Admin SDK não configurado: Variáveis de ambiente ausentes.');
                }
            }
        }
        catch (e) {
            console.error('⚠️ Firebase Admin SDK não configurado:', e.message);
        }
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
        try {
            const messages = tokens.map(t => ({
                token: t.token,
                notification: { title: notification.title, body: notification.body },
                data: notification.data || {},
            }));
            const response = await admin.messaging().sendEach(messages);
            if (response.failureCount > 0) {
                response.responses.forEach(async (resp, idx) => {
                    if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
                        await this.removeToken(messages[idx].token);
                    }
                });
            }
            return {
                sent: true,
                tokens: tokens.length,
                notification,
                successCount: response.successCount,
                failureCount: response.failureCount,
                message: 'Notificação enviada com sucesso.',
            };
        }
        catch (e) {
            console.error('Erro ao enviar push notification:', e);
            return { sent: false, reason: e.message, tokens: tokens.length };
        }
    }
    async sendToAll(notification) {
        const allTokens = await this.prisma.pushToken.findMany({
            where: { isActive: true },
            select: { token: true, representativeId: true },
        });
        if (allTokens.length === 0) {
            return { sent: false, reason: 'Nenhum token registrado no sistema', totalTokens: 0 };
        }
        try {
            const messages = allTokens.map(t => ({
                token: t.token,
                notification: { title: notification.title, body: notification.body },
                data: notification.data || {},
            }));
            const chunkSize = 500;
            let successCount = 0;
            let failureCount = 0;
            for (let i = 0; i < messages.length; i += chunkSize) {
                const chunk = messages.slice(i, i + chunkSize);
                const response = await admin.messaging().sendEach(chunk);
                successCount += response.successCount;
                failureCount += response.failureCount;
                if (response.failureCount > 0) {
                    response.responses.forEach(async (resp, idx) => {
                        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
                            await this.removeToken(chunk[idx].token);
                        }
                    });
                }
            }
            return {
                sent: true,
                totalTokens: allTokens.length,
                uniqueRepresentatives: new Set(allTokens.map(t => t.representativeId)).size,
                notification,
                successCount,
                failureCount,
                message: 'Notificação em massa enviada com sucesso.',
            };
        }
        catch (e) {
            console.error('Erro ao enviar push notification list:', e);
            return { sent: false, reason: e.message, totalTokens: allTokens.length };
        }
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