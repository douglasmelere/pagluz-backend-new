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
exports.ConsumerChangeRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const enums_1 = require("../../common/enums");
const audit_service_1 = require("../../common/services/audit.service");
let ConsumerChangeRequestsService = class ConsumerChangeRequestsService {
    prisma;
    auditService;
    constructor(prisma, auditService) {
        this.prisma = prisma;
        this.auditService = auditService;
    }
    async createChangeRequest(consumerId, representativeId, newValues, userId) {
        const consumer = await this.prisma.consumer.findUnique({
            where: { id: consumerId },
            include: { Representative: true },
        });
        if (!consumer) {
            throw new common_1.NotFoundException('Consumidor não encontrado');
        }
        if (consumer.representativeId !== representativeId) {
            throw new common_1.ForbiddenException('Você só pode editar consumidores que você criou');
        }
        const changedFields = Object.keys(newValues).filter((key) => consumer[key] !== newValues[key]);
        if (changedFields.length === 0) {
            throw new common_1.BadRequestException('Nenhuma alteração foi detectada');
        }
        const changeRequest = await this.prisma.consumerChangeRequest.create({
            data: {
                consumerId,
                representativeId,
                oldValues: this.extractOldValues(consumer, changedFields),
                newValues,
                changedFields,
                status: enums_1.ChangeRequestStatus.PENDING,
            },
            include: {
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                    },
                },
                representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (userId) {
            await this.auditService.log({
                userId,
                action: 'CREATE_CHANGE_REQUEST',
                entityType: 'ConsumerChangeRequest',
                entityId: changeRequest.id,
                newValues: {
                    consumerId,
                    changedFields,
                },
            });
        }
        return changeRequest;
    }
    async approveChangeRequest(changeRequestId, adminUserId, rejectionReason) {
        const changeRequest = await this.prisma.consumerChangeRequest.findUnique({
            where: { id: changeRequestId },
            include: { consumer: true },
        });
        if (!changeRequest) {
            throw new common_1.NotFoundException('Solicitação de mudança não encontrada');
        }
        if (changeRequest.status !== enums_1.ChangeRequestStatus.PENDING) {
            throw new common_1.BadRequestException('Esta solicitação já foi processada');
        }
        const updatedConsumer = await this.prisma.consumer.update({
            where: { id: changeRequest.consumerId },
            data: changeRequest.newValues,
        });
        await this.prisma.consumerChangeRequest.update({
            where: { id: changeRequestId },
            data: {
                status: enums_1.ChangeRequestStatus.APPROVED,
                reviewedByUserId: adminUserId,
                reviewedAt: new Date(),
            },
        });
        await this.auditService.log({
            userId: adminUserId,
            action: 'APPROVE_CHANGE_REQUEST',
            entityType: 'Consumer',
            entityId: changeRequest.consumerId,
            oldValues: changeRequest.oldValues,
            newValues: changeRequest.newValues,
        });
        return {
            changeRequest,
            consumer: updatedConsumer,
        };
    }
    async rejectChangeRequest(changeRequestId, adminUserId, rejectionReason) {
        const changeRequest = await this.prisma.consumerChangeRequest.findUnique({
            where: { id: changeRequestId },
        });
        if (!changeRequest) {
            throw new common_1.NotFoundException('Solicitação de mudança não encontrada');
        }
        if (changeRequest.status !== enums_1.ChangeRequestStatus.PENDING) {
            throw new common_1.BadRequestException('Esta solicitação já foi processada');
        }
        const updated = await this.prisma.consumerChangeRequest.update({
            where: { id: changeRequestId },
            data: {
                status: enums_1.ChangeRequestStatus.REJECTED,
                reviewedByUserId: adminUserId,
                reviewedAt: new Date(),
                rejectionReason,
            },
            include: {
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                    },
                },
                representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        await this.auditService.log({
            userId: adminUserId,
            action: 'REJECT_CHANGE_REQUEST',
            entityType: 'ConsumerChangeRequest',
            entityId: changeRequestId,
            metadata: {
                rejectionReason,
                consumerId: changeRequest.consumerId,
            },
        });
        return updated;
    }
    async getPendingRequests(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            this.prisma.consumerChangeRequest.findMany({
                where: {
                    status: enums_1.ChangeRequestStatus.PENDING,
                },
                include: {
                    consumer: {
                        select: {
                            id: true,
                            name: true,
                            cpfCnpj: true,
                            ucNumber: true,
                        },
                    },
                    representative: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    requestedAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.consumerChangeRequest.count({
                where: {
                    status: enums_1.ChangeRequestStatus.PENDING,
                },
            }),
        ]);
        return {
            data: requests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getRepresentativeRequests(representativeId) {
        return this.prisma.consumerChangeRequest.findMany({
            where: {
                representativeId,
            },
            include: {
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                    },
                },
                reviewedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                requestedAt: 'desc',
            },
        });
    }
    extractOldValues(consumer, fields) {
        const oldValues = {};
        fields.forEach((field) => {
            oldValues[field] = consumer[field];
        });
        return oldValues;
    }
};
exports.ConsumerChangeRequestsService = ConsumerChangeRequestsService;
exports.ConsumerChangeRequestsService = ConsumerChangeRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], ConsumerChangeRequestsService);
//# sourceMappingURL=consumer-change-requests.service.js.map