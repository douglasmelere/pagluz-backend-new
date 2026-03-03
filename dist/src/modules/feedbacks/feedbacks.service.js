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
exports.FeedbacksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let FeedbacksService = class FeedbacksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(representativeId, dto) {
        return this.prisma.feedback.create({
            data: {
                representativeId,
                type: dto.type,
                subject: dto.subject,
                description: dto.description,
                category: dto.category ?? null,
                attachmentUrl: dto.attachmentUrl ?? null,
                attachmentFileName: dto.attachmentFileName ?? null,
            },
            include: {
                representative: { select: { id: true, name: true, email: true } },
                responses: true,
            },
        });
    }
    async findByRepresentative(representativeId) {
        return this.prisma.feedback.findMany({
            where: { representativeId },
            orderBy: { createdAt: 'desc' },
            include: {
                responses: {
                    orderBy: { createdAt: 'asc' },
                },
                _count: {
                    select: { responses: true },
                },
            },
        });
    }
    async findOneByRepresentative(feedbackId, representativeId) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { id: feedbackId },
            include: {
                representative: { select: { id: true, name: true, email: true } },
                responses: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('Feedback não encontrado.');
        }
        if (feedback.representativeId !== representativeId) {
            throw new common_1.ForbiddenException('Você não tem permissão para acessar este feedback.');
        }
        return feedback;
    }
    async respondAsRepresentative(feedbackId, representativeId, representativeName, dto) {
        const feedback = await this.findOneByRepresentative(feedbackId, representativeId);
        if (feedback.status === 'RESOLVED' || feedback.status === 'REJECTED') {
            throw new common_1.ForbiddenException('Este feedback já foi encerrado e não aceita novas respostas.');
        }
        return this.prisma.feedbackResponse.create({
            data: {
                feedbackId,
                message: dto.message,
                authorType: 'REPRESENTATIVE',
                authorId: representativeId,
                authorName: representativeName,
            },
        });
    }
    async countByRepresentative(representativeId) {
        const [total, open, inAnalysis, resolved, rejected] = await Promise.all([
            this.prisma.feedback.count({ where: { representativeId } }),
            this.prisma.feedback.count({ where: { representativeId, status: 'OPEN' } }),
            this.prisma.feedback.count({ where: { representativeId, status: 'IN_ANALYSIS' } }),
            this.prisma.feedback.count({ where: { representativeId, status: 'RESOLVED' } }),
            this.prisma.feedback.count({ where: { representativeId, status: 'REJECTED' } }),
        ]);
        return { total, open, inAnalysis, resolved, rejected };
    }
    async findAll(filters) {
        const where = {};
        if (filters?.status)
            where.status = filters.status;
        if (filters?.type)
            where.type = filters.type;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.representativeId)
            where.representativeId = filters.representativeId;
        return this.prisma.feedback.findMany({
            where,
            orderBy: [
                { status: 'asc' },
                { createdAt: 'desc' },
            ],
            include: {
                representative: { select: { id: true, name: true, email: true, phone: true } },
                responses: {
                    orderBy: { createdAt: 'asc' },
                },
                _count: {
                    select: { responses: true },
                },
            },
        });
    }
    async findOne(feedbackId) {
        const feedback = await this.prisma.feedback.findUnique({
            where: { id: feedbackId },
            include: {
                representative: { select: { id: true, name: true, email: true, phone: true, city: true, state: true } },
                responses: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!feedback) {
            throw new common_1.NotFoundException('Feedback não encontrado.');
        }
        return feedback;
    }
    async updateStatus(feedbackId, dto, adminUserId) {
        await this.findOne(feedbackId);
        const data = { status: dto.status };
        if (dto.priority)
            data.priority = dto.priority;
        if (dto.status === 'RESOLVED' || dto.status === 'REJECTED') {
            data.resolvedAt = new Date();
            data.resolvedByUserId = adminUserId;
        }
        if (dto.status === 'OPEN') {
            data.resolvedAt = null;
            data.resolvedByUserId = null;
        }
        return this.prisma.feedback.update({
            where: { id: feedbackId },
            data,
            include: {
                representative: { select: { id: true, name: true, email: true } },
                responses: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }
    async respondAsAdmin(feedbackId, adminId, adminName, dto) {
        await this.findOne(feedbackId);
        const feedback = await this.prisma.feedback.findUnique({
            where: { id: feedbackId },
        });
        if (feedback?.status === 'OPEN') {
            await this.prisma.feedback.update({
                where: { id: feedbackId },
                data: { status: 'IN_ANALYSIS' },
            });
        }
        return this.prisma.feedbackResponse.create({
            data: {
                feedbackId,
                message: dto.message,
                authorType: 'ADMIN',
                authorId: adminId,
                authorName: adminName,
            },
        });
    }
    async remove(feedbackId) {
        await this.findOne(feedbackId);
        return this.prisma.feedback.delete({ where: { id: feedbackId } });
    }
    async getMetrics() {
        const [total, open, inAnalysis, resolved, rejected] = await Promise.all([
            this.prisma.feedback.count(),
            this.prisma.feedback.count({ where: { status: 'OPEN' } }),
            this.prisma.feedback.count({ where: { status: 'IN_ANALYSIS' } }),
            this.prisma.feedback.count({ where: { status: 'RESOLVED' } }),
            this.prisma.feedback.count({ where: { status: 'REJECTED' } }),
        ]);
        const byType = await this.prisma.feedback.groupBy({
            by: ['type'],
            _count: { id: true },
        });
        const byPriority = await this.prisma.feedback.groupBy({
            by: ['priority'],
            _count: { id: true },
        });
        const resolvedFeedbacks = await this.prisma.feedback.findMany({
            where: { status: 'RESOLVED', resolvedAt: { not: null } },
            select: { createdAt: true, resolvedAt: true },
        });
        let avgResolutionHours = 0;
        if (resolvedFeedbacks.length > 0) {
            const totalHours = resolvedFeedbacks.reduce((sum, f) => {
                const diff = (f.resolvedAt.getTime() - f.createdAt.getTime()) / (1000 * 60 * 60);
                return sum + diff;
            }, 0);
            avgResolutionHours = Math.round((totalHours / resolvedFeedbacks.length) * 10) / 10;
        }
        return {
            total,
            open,
            inAnalysis,
            resolved,
            rejected,
            byType: byType.map(t => ({ type: t.type, count: t._count.id })),
            byPriority: byPriority.map(p => ({ priority: p.priority, count: p._count.id })),
            avgResolutionHours,
        };
    }
};
exports.FeedbacksService = FeedbacksService;
exports.FeedbacksService = FeedbacksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedbacksService);
//# sourceMappingURL=feedbacks.service.js.map