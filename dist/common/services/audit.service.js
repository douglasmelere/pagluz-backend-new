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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let AuditService = class AuditService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(data) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: data.userId || null,
                    action: data.action,
                    entityType: data.entityType,
                    entityId: data.entityId,
                    oldValues: data.oldValues || null,
                    newValues: data.newValues || null,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                    metadata: data.metadata || null,
                },
            });
        }
        catch (error) {
            console.error('Erro ao registrar log de auditoria:', error);
        }
    }
    async logLogin(userId, ipAddress, userAgent) {
        await this.log({
            userId,
            action: 'LOGIN',
            entityType: 'User',
            entityId: userId,
            ipAddress,
            userAgent,
            metadata: { timestamp: new Date().toISOString() },
        });
    }
    async logLogout(userId, ipAddress, userAgent) {
        await this.log({
            userId,
            action: 'LOGOUT',
            entityType: 'User',
            entityId: userId,
            ipAddress,
            userAgent,
            metadata: { timestamp: new Date().toISOString() },
        });
    }
    async logCreate(userId, entityType, entityId, newValues, ipAddress, userAgent) {
        await this.log({
            userId,
            action: 'CREATE',
            entityType,
            entityId,
            newValues,
            ipAddress,
            userAgent,
        });
    }
    async logUpdate(userId, entityType, entityId, oldValues, newValues, ipAddress, userAgent) {
        await this.log({
            userId,
            action: 'UPDATE',
            entityType,
            entityId,
            oldValues,
            newValues,
            ipAddress,
            userAgent,
        });
    }
    async logDelete(userId, entityType, entityId, oldValues, ipAddress, userAgent) {
        await this.log({
            userId,
            action: 'DELETE',
            entityType,
            entityId,
            oldValues,
            ipAddress,
            userAgent,
        });
    }
    async logSecurityEvent(userId, action, details, ipAddress, userAgent) {
        await this.log({
            userId,
            action,
            entityType: 'Security',
            metadata: details,
            ipAddress,
            userAgent,
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map