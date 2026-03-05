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
exports.AnnouncementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const push_notification_service_1 = require("../push-notifications/push-notification.service");
let AnnouncementsService = class AnnouncementsService {
    prisma;
    pushNotificationService;
    constructor(prisma, pushNotificationService) {
        this.prisma = prisma;
        this.pushNotificationService = pushNotificationService;
    }
    async create(dto) {
        if (dto.representativeId) {
            const rep = await this.prisma.representative.findUnique({
                where: { id: dto.representativeId },
            });
            if (!rep)
                throw new common_1.NotFoundException('Representante não encontrado.');
        }
        const announcement = await this.prisma.announcement.create({
            data: {
                title: dto.title,
                message: dto.message,
                priority: dto.priority ?? 'NORMAL',
                representativeId: dto.representativeId ?? null,
            },
            include: {
                representative: { select: { id: true, name: true, email: true } },
            },
        });
        const emoji = dto.priority === 'HIGH' ? '🚨' : '📢';
        if (dto.representativeId) {
            await this.pushNotificationService.sendToRepresentative(dto.representativeId, {
                title: `Novo Comunicado ${emoji}`,
                body: dto.title
            });
        }
        else {
            await this.pushNotificationService.sendToAll({
                title: `Aviso Importante ${emoji}`,
                body: dto.title
            });
        }
        return announcement;
    }
    async findAll() {
        return this.prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                representative: { select: { id: true, name: true, email: true } },
                reads: { select: { representativeId: true, readAt: true } },
            },
        });
    }
    async findOne(id) {
        const announcement = await this.prisma.announcement.findUnique({
            where: { id },
            include: {
                representative: { select: { id: true, name: true, email: true } },
                reads: { select: { representativeId: true, readAt: true } },
            },
        });
        if (!announcement)
            throw new common_1.NotFoundException('Comunicado não encontrado.');
        return announcement;
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.announcement.delete({ where: { id } });
    }
    async findForRepresentative(representativeId) {
        return this.prisma.announcement.findMany({
            where: {
                OR: [
                    { representativeId: null },
                    { representativeId: representativeId },
                ],
            },
            orderBy: { createdAt: 'desc' },
            include: {
                reads: {
                    where: { representativeId },
                    select: { readAt: true },
                },
            },
        });
    }
    async markAsRead(announcementId, representativeId) {
        await this.findOne(announcementId);
        return this.prisma.announcementRead.upsert({
            where: {
                announcementId_representativeId: { announcementId, representativeId },
            },
            update: { readAt: new Date() },
            create: { announcementId, representativeId },
        });
    }
    async countUnread(representativeId) {
        const visible = await this.prisma.announcement.findMany({
            where: {
                OR: [
                    { representativeId: null },
                    { representativeId },
                ],
            },
            select: { id: true },
        });
        const visibleIds = visible.map((a) => a.id);
        const readCount = await this.prisma.announcementRead.count({
            where: { representativeId, announcementId: { in: visibleIds } },
        });
        return { unread: visibleIds.length - readCount };
    }
};
exports.AnnouncementsService = AnnouncementsService;
exports.AnnouncementsService = AnnouncementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        push_notification_service_1.PushNotificationService])
], AnnouncementsService);
//# sourceMappingURL=announcements.service.js.map