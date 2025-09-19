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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const prisma_service_1 = require("../../config/prisma.service");
let AuditController = class AuditController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAuditLogs(req, page = '1', limit = '50', userId, action, entityType, startDate, endDate) {
        if (req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.HttpException('Apenas SUPER_ADMIN pode acessar logs de auditoria', common_1.HttpStatus.FORBIDDEN);
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (action) {
            where.action = action;
        }
        if (entityType) {
            where.entityType = entityType;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limitNum,
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        const formattedLogs = logs.map(log => ({
            id: log.id,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            oldValues: log.oldValues,
            newValues: log.newValues,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            metadata: log.metadata,
            createdAt: log.createdAt,
            user: log.user,
        }));
        return {
            logs: formattedLogs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };
    }
    async getAuditStatistics(req) {
        if (req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.HttpException('Apenas SUPER_ADMIN pode acessar estatísticas de auditoria', common_1.HttpStatus.FORBIDDEN);
        }
        const [totalLogs, actionsByType, usersByActivity, recentActivity, securityEvents,] = await Promise.all([
            this.prisma.auditLog.count(),
            this.prisma.auditLog.groupBy({
                by: ['action'],
                _count: { action: true },
                orderBy: { _count: { action: 'desc' } },
                take: 10,
            }),
            this.prisma.auditLog.groupBy({
                by: ['userId'],
                _count: { userId: true },
                orderBy: { _count: { userId: 'desc' } },
                take: 10,
            }),
            this.prisma.auditLog.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
            }),
            this.prisma.auditLog.count({
                where: {
                    action: {
                        in: ['LOGIN_FAILED', 'TOKEN_INVALIDATED', 'FORCE_LOGOUT_ALL', 'FORCE_LOGOUT_USER'],
                    },
                },
            }),
        ]);
        const topUsers = await Promise.all(usersByActivity.map(async (user) => {
            if (!user.userId) {
                return {
                    userId: null,
                    name: 'Usuário removido',
                    email: 'N/A',
                    role: 'N/A',
                    actionCount: user._count.userId,
                };
            }
            const userInfo = await this.prisma.user.findUnique({
                where: { id: user.userId },
                select: { name: true, email: true, role: true },
            });
            return {
                userId: user.userId,
                name: userInfo?.name || 'Usuário removido',
                email: userInfo?.email || 'N/A',
                role: userInfo?.role || 'N/A',
                actionCount: user._count.userId,
            };
        }));
        return {
            totalLogs,
            actionsByType: actionsByType.map(item => ({
                action: item.action,
                count: item._count.action,
            })),
            topUsers,
            recentActivity,
            securityEvents,
            lastUpdated: new Date().toISOString(),
        };
    }
    async getUserAuditLogs(req, page = '1', limit = '50') {
        if (req.user.role !== 'SUPER_ADMIN') {
            throw new common_1.HttpException('Apenas SUPER_ADMIN pode acessar logs de auditoria', common_1.HttpStatus.FORBIDDEN);
        }
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const skip = (pageNum - 1) * limitNum;
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where: { userId: req.params.userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            this.prisma.auditLog.count({
                where: { userId: req.params.userId },
            }),
        ]);
        const formattedLogs = logs.map(log => ({
            id: log.id,
            action: log.action,
            entityType: log.entityType,
            entityId: log.entityId,
            oldValues: log.oldValues,
            newValues: log.newValues,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            metadata: log.metadata,
            createdAt: log.createdAt,
        }));
        return {
            logs: formattedLogs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        };
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Listar logs de auditoria (apenas SUPER_ADMIN)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de logs de auditoria' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: 'Número da página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Itens por página' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, description: 'Filtrar por usuário' }),
    (0, swagger_1.ApiQuery)({ name: 'action', required: false, description: 'Filtrar por ação' }),
    (0, swagger_1.ApiQuery)({ name: 'entityType', required: false, description: 'Filtrar por tipo de entidade' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Data inicial (ISO)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'Data final (ISO)' }),
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('userId')),
    __param(4, (0, common_1.Query)('action')),
    __param(5, (0, common_1.Query)('entityType')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditLogs", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Estatísticas de auditoria (apenas SUPER_ADMIN)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estatísticas dos logs' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado' }),
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditStatistics", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Logs de um usuário específico (apenas SUPER_ADMIN)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logs do usuário' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acesso negado' }),
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getUserAuditLogs", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('Auditoria'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('audit'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map