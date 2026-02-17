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
exports.CommissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const enums_1 = require("../../common/enums");
const audit_service_1 = require("../../common/services/audit.service");
const settings_service_1 = require("../settings/settings.service");
const payment_proof_storage_service_1 = require("../../common/services/payment-proof-storage.service");
let CommissionsService = class CommissionsService {
    prisma;
    auditService;
    settingsService;
    paymentProofStorage;
    constructor(prisma, auditService, settingsService, paymentProofStorage) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.settingsService = settingsService;
        this.paymentProofStorage = paymentProofStorage;
    }
    calculateCommission(kwhConsumption, kwhPrice) {
        const invoiceValue = kwhConsumption * kwhPrice;
        let commissionPercentage = 0;
        if (kwhConsumption >= 1500) {
            commissionPercentage = 0.375;
        }
        else if (kwhConsumption >= 1000) {
            commissionPercentage = 0.35;
        }
        else if (kwhConsumption >= 600) {
            commissionPercentage = 0.30;
        }
        else {
            commissionPercentage = 0;
        }
        const commission = invoiceValue * commissionPercentage;
        return Math.round(commission * 100) / 100;
    }
    async createCommissionForApprovedConsumer(consumerId) {
        const kwhPrice = await this.settingsService.getCurrentKwhPrice();
        const consumer = await this.prisma.consumer.findUnique({
            where: { id: consumerId },
            include: {
                Representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!consumer) {
            throw new common_1.NotFoundException('Consumidor não encontrado');
        }
        if (!consumer.representativeId) {
            throw new common_1.BadRequestException('Consumidor não possui representante vinculado');
        }
        if (consumer.approvalStatus !== 'APPROVED') {
            throw new common_1.BadRequestException('Consumidor não está aprovado');
        }
        const existingCommission = await this.prisma.commission.findFirst({
            where: {
                consumerId: consumer.id,
                representativeId: consumer.representativeId,
            },
        });
        if (existingCommission) {
            throw new common_1.BadRequestException('Comissão já existe para este consumidor');
        }
        const commissionValue = this.calculateCommission(consumer.averageMonthlyConsumption, kwhPrice);
        const commission = await this.prisma.commission.create({
            data: {
                representativeId: consumer.representativeId,
                consumerId: consumer.id,
                kwhConsumption: consumer.averageMonthlyConsumption,
                kwhPrice,
                commissionValue,
                status: enums_1.CommissionStatus.CALCULATED,
                calculatedAt: new Date(),
            },
            include: {
                representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                        averageMonthlyConsumption: true,
                    },
                },
            },
        });
        await this.auditService.log({
            action: 'COMMISSION_CREATED',
            entityType: 'Commission',
            entityId: commission.id,
            newValues: {
                representativeId: commission.representativeId,
                consumerId: commission.consumerId,
                commissionValue: commission.commissionValue,
                kwhConsumption: commission.kwhConsumption,
                kwhPrice: commission.kwhPrice,
            },
        });
        return commission;
    }
    async getRepresentativeCommissions(representativeId) {
        const commissions = await this.prisma.commission.findMany({
            where: { representativeId },
            select: {
                id: true,
                representativeId: true,
                consumerId: true,
                kwhConsumption: true,
                kwhPrice: true,
                commissionValue: true,
                status: true,
                calculatedAt: true,
                paidAt: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
                paymentProofUrl: true,
                paymentProofFileName: true,
                paymentProofUploadedAt: true,
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                        averageMonthlyConsumption: true,
                        city: true,
                        state: true,
                        approvalStatus: true,
                        approvedAt: true,
                    },
                },
            },
            orderBy: {
                calculatedAt: 'desc',
            },
        });
        if (commissions.length > 0) {
            console.log('DEBUG: Primeira comissão retornada:', JSON.stringify(commissions[0], null, 2));
            console.log('DEBUG: Tem paymentProofUrl?', 'paymentProofUrl' in commissions[0]);
        }
        return commissions;
    }
    async getRepresentativeCommissionStats(representativeId) {
        const commissions = await this.prisma.commission.findMany({
            where: { representativeId },
            select: {
                commissionValue: true,
                status: true,
                calculatedAt: true,
                paidAt: true,
                consumer: {
                    select: {
                        name: true,
                        averageMonthlyConsumption: true,
                    },
                },
            },
        });
        const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionValue, 0);
        const paidCommissions = commissions
            .filter(c => c.status === 'PAID')
            .reduce((sum, c) => sum + c.commissionValue, 0);
        const pendingCommissions = commissions
            .filter(c => c.status === 'CALCULATED')
            .reduce((sum, c) => sum + c.commissionValue, 0);
        const statusBreakdown = commissions.reduce((acc, c) => {
            acc[c.status.toLowerCase()] = (acc[c.status.toLowerCase()] || 0) + 1;
            return acc;
        }, {});
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyCommissions = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const monthCommissions = commissions.filter(c => {
                const commissionDate = new Date(c.calculatedAt);
                return commissionDate >= monthStart && commissionDate <= monthEnd;
            });
            monthlyCommissions.push({
                month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                count: monthCommissions.length,
                value: monthCommissions.reduce((sum, c) => sum + c.commissionValue, 0),
            });
        }
        return {
            totalCommissions: Math.round(totalCommissions * 100) / 100,
            paidCommissions: Math.round(paidCommissions * 100) / 100,
            pendingCommissions: Math.round(pendingCommissions * 100) / 100,
            totalConsumers: commissions.length,
            statusBreakdown,
            monthlyCommissions,
        };
    }
    async getAllCommissions() {
        const commissions = await this.prisma.commission.findMany({
            include: {
                representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                        averageMonthlyConsumption: true,
                        city: true,
                        state: true,
                    },
                },
            },
            orderBy: {
                calculatedAt: 'desc',
            },
        });
        return commissions;
    }
    async getPendingCommissions() {
        const commissions = await this.prisma.commission.findMany({
            where: { status: enums_1.CommissionStatus.CALCULATED },
            include: {
                representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                        averageMonthlyConsumption: true,
                        city: true,
                        state: true,
                    },
                },
            },
            orderBy: {
                calculatedAt: 'desc',
            },
        });
        return commissions;
    }
    async markCommissionAsPaid(commissionId, userId) {
        const commission = await this.prisma.commission.findUnique({
            where: { id: commissionId },
            include: {
                representative: true,
                consumer: true,
            },
        });
        if (!commission) {
            throw new common_1.NotFoundException('Comissão não encontrada');
        }
        if (commission.status === 'PAID') {
            throw new common_1.BadRequestException('Comissão já foi marcada como paga');
        }
        const updatedCommission = await this.prisma.commission.update({
            where: { id: commissionId },
            data: {
                status: enums_1.CommissionStatus.PAID,
                paidAt: new Date(),
            },
            include: {
                representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                    },
                },
            },
        });
        await this.auditService.log({
            userId,
            action: 'COMMISSION_PAID',
            entityType: 'Commission',
            entityId: commissionId,
            oldValues: commission,
            newValues: updatedCommission,
        });
        return updatedCommission;
    }
    async getCommissionsByPeriod(representativeId, startDate, endDate) {
        const commissions = await this.prisma.commission.findMany({
            where: {
                representativeId,
                calculatedAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            include: {
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                        averageMonthlyConsumption: true,
                        city: true,
                        state: true,
                    },
                },
            },
            orderBy: {
                calculatedAt: 'desc',
            },
        });
        return commissions;
    }
    async getCommissionDetails(commissionId) {
        const commission = await this.prisma.commission.findUnique({
            where: { id: commissionId },
            include: {
                representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                        averageMonthlyConsumption: true,
                        city: true,
                        state: true,
                        approvalStatus: true,
                        approvedAt: true,
                    },
                },
            },
        });
        if (!commission) {
            throw new common_1.NotFoundException('Comissão não encontrada');
        }
        return commission;
    }
    async uploadPaymentProof(commissionId, file, userId) {
        const commission = await this.prisma.commission.findUnique({
            where: { id: commissionId },
            include: {
                representative: true,
                consumer: true,
            },
        });
        if (!commission) {
            throw new common_1.NotFoundException('Comissão não encontrada');
        }
        if (commission.paymentProofFileName) {
            try {
                await this.paymentProofStorage.deletePaymentProof(commission.paymentProofFileName);
            }
            catch (error) {
                console.error('Erro ao deletar comprovante anterior:', error);
            }
        }
        const timestamp = Date.now();
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `comprovante_${commissionId}_${timestamp}.${fileExtension}`;
        const { url, path } = await this.paymentProofStorage.uploadPaymentProof(file, fileName, commissionId);
        const updatedCommission = await this.prisma.commission.update({
            where: { id: commissionId },
            data: {
                paymentProofUrl: url,
                paymentProofFileName: path,
                paymentProofUploadedAt: new Date(),
                status: enums_1.CommissionStatus.PAID,
                paidAt: new Date(),
            },
            include: {
                representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                    },
                },
            },
        });
        await this.auditService.log({
            userId,
            action: 'PAYMENT_PROOF_UPLOADED',
            entityType: 'Commission',
            entityId: commissionId,
            oldValues: commission,
            newValues: updatedCommission,
        });
        return updatedCommission;
    }
    async downloadPaymentProof(commissionId) {
        const commission = await this.prisma.commission.findUnique({
            where: { id: commissionId },
            select: {
                id: true,
                paymentProofFileName: true,
                paymentProofUrl: true,
            },
        });
        if (!commission) {
            throw new common_1.NotFoundException('Comissão não encontrada');
        }
        if (!commission.paymentProofFileName) {
            throw new common_1.NotFoundException('Comprovante de pagamento não encontrado para esta comissão');
        }
        const fileBuffer = await this.paymentProofStorage.downloadPaymentProof(commission.paymentProofFileName);
        const fileName = commission.paymentProofFileName.split('/').pop() || 'comprovante';
        const fileExtension = fileName.split('.').pop() || 'pdf';
        let mimeType = 'application/pdf';
        if (['jpg', 'jpeg'].includes(fileExtension.toLowerCase())) {
            mimeType = 'image/jpeg';
        }
        else if (fileExtension.toLowerCase() === 'png') {
            mimeType = 'image/png';
        }
        return {
            buffer: fileBuffer,
            fileName,
            mimeType,
        };
    }
    async deletePaymentProof(commissionId, userId) {
        const commission = await this.prisma.commission.findUnique({
            where: { id: commissionId },
        });
        if (!commission) {
            throw new common_1.NotFoundException('Comissão não encontrada');
        }
        if (!commission.paymentProofFileName) {
            throw new common_1.NotFoundException('Comprovante de pagamento não encontrado para esta comissão');
        }
        try {
            await this.paymentProofStorage.deletePaymentProof(commission.paymentProofFileName);
        }
        catch (error) {
            console.error('Erro ao deletar comprovante do storage:', error);
        }
        const updatedCommission = await this.prisma.commission.update({
            where: { id: commissionId },
            data: {
                paymentProofUrl: null,
                paymentProofFileName: null,
                paymentProofUploadedAt: null,
            },
        });
        await this.auditService.log({
            userId,
            action: 'PAYMENT_PROOF_DELETED',
            entityType: 'Commission',
            entityId: commissionId,
            oldValues: commission,
            newValues: updatedCommission,
        });
        return updatedCommission;
    }
};
exports.CommissionsService = CommissionsService;
exports.CommissionsService = CommissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        settings_service_1.SettingsService,
        payment_proof_storage_service_1.PaymentProofStorageService])
], CommissionsService);
//# sourceMappingURL=commissions.service.js.map