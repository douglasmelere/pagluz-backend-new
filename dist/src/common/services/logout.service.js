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
exports.LogoutService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const audit_service_1 = require("./audit.service");
const crypto = require("crypto");
let LogoutService = class LogoutService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async logout(userId, token, ipAddress, userAgent) {
        try {
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const payload = this.extractPayloadFromToken(token);
            const expiresAt = payload ? new Date(payload.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
            await this.prisma.blacklistedToken.create({
                data: {
                    token: tokenHash,
                    userId,
                    expiresAt,
                    reason: 'LOGOUT',
                },
            });
            await this.auditService.logLogout(userId, ipAddress, userAgent);
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    lastLoginAt: new Date(),
                },
            });
            return { message: 'Logout realizado com sucesso' };
        }
        catch (error) {
            console.error('Erro durante logout:', error);
            throw new common_1.UnauthorizedException('Erro durante logout');
        }
    }
    async invalidateToken(token, userId, reason = 'SECURITY') {
        try {
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const payload = this.extractPayloadFromToken(token);
            const expiresAt = payload ? new Date(payload.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);
            await this.prisma.blacklistedToken.create({
                data: {
                    token: tokenHash,
                    userId,
                    expiresAt,
                    reason,
                },
            });
            await this.auditService.logSecurityEvent(userId, 'TOKEN_INVALIDATED', { reason, tokenHash }, undefined, undefined);
            return { message: 'Token invalidado com sucesso' };
        }
        catch (error) {
            console.error('Erro ao invalidar token:', error);
            throw new common_1.UnauthorizedException('Erro ao invalidar token');
        }
    }
    async isTokenBlacklisted(token) {
        try {
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            const blacklistedToken = await this.prisma.blacklistedToken.findUnique({
                where: { token: tokenHash },
            });
            if (!blacklistedToken) {
                return false;
            }
            if (blacklistedToken.expiresAt < new Date()) {
                await this.prisma.blacklistedToken.delete({
                    where: { id: blacklistedToken.id },
                });
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Erro ao verificar blacklist:', error);
            return false;
        }
    }
    async cleanupExpiredTokens() {
        try {
            const result = await this.prisma.blacklistedToken.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                },
            });
            console.log(`Limpeza de tokens expirados: ${result.count} tokens removidos`);
            return result.count;
        }
        catch (error) {
            console.error('Erro na limpeza de tokens:', error);
            return 0;
        }
    }
    extractPayloadFromToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }
            const payload = parts[1];
            const decoded = Buffer.from(payload, 'base64').toString('utf-8');
            return JSON.parse(decoded);
        }
        catch (error) {
            return null;
        }
    }
    async forceLogoutAllSessions(userId, reason = 'SECURITY_ADMIN') {
        try {
            await this.auditService.logSecurityEvent(userId, 'FORCE_LOGOUT_ALL', { reason }, undefined, undefined);
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    lastLoginAt: new Date(),
                },
            });
            return { message: 'Todas as sessões foram invalidadas' };
        }
        catch (error) {
            console.error('Erro ao forçar logout de todas as sessões:', error);
            throw new common_1.UnauthorizedException('Erro ao invalidar sessões');
        }
    }
};
exports.LogoutService = LogoutService;
exports.LogoutService = LogoutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], LogoutService);
//# sourceMappingURL=logout.service.js.map