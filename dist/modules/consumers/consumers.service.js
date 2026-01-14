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
exports.ConsumersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const client_1 = require("@prisma/client");
const enums_1 = require("../../common/enums");
const audit_service_1 = require("../../common/services/audit.service");
const commissions_service_1 = require("../commissions/commissions.service");
const supabase_storage_service_1 = require("../../common/services/supabase-storage.service");
const ocr_service_1 = require("../../common/services/ocr.service");
const consumer_change_requests_service_1 = require("./consumer-change-requests.service");
let ConsumersService = class ConsumersService {
    prisma;
    auditService;
    commissionsService;
    supabaseStorage;
    ocrService;
    changeRequestsService;
    constructor(prisma, auditService, commissionsService, supabaseStorage, ocrService, changeRequestsService) {
        this.prisma = prisma;
        this.auditService = auditService;
        this.commissionsService = commissionsService;
        this.supabaseStorage = supabaseStorage;
        this.ocrService = ocrService;
        this.changeRequestsService = changeRequestsService;
    }
    async create(createConsumerDto) {
        const { cpfCnpj, generatorId, birthDate, arrivalDate, ...consumerData } = createConsumerDto;
        if (generatorId) {
            const generator = await this.prisma.generator.findUnique({
                where: { id: generatorId },
            });
            if (!generator) {
                throw new common_1.NotFoundException('Gerador não encontrado');
            }
        }
        const consumer = await this.prisma.consumer.create({
            data: {
                cpfCnpj,
                generatorId,
                birthDate: birthDate ? new Date(birthDate) : null,
                arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
                approvalStatus: enums_1.ConsumerApprovalStatus.APPROVED,
                submittedByRepresentativeId: null,
                ...consumerData,
            },
            include: {
                generator: true,
            },
        });
        return consumer;
    }
    async createAsRepresentative(createConsumerDto, representativeId) {
        const { cpfCnpj, generatorId, birthDate, arrivalDate, ...consumerData } = createConsumerDto;
        const representative = await this.prisma.representative.findUnique({
            where: { id: representativeId },
        });
        if (!representative) {
            throw new common_1.NotFoundException('Representante não encontrado');
        }
        if (representative.status !== 'ACTIVE') {
            throw new common_1.BadRequestException('Representante não está ativo');
        }
        if (generatorId) {
            const generator = await this.prisma.generator.findUnique({
                where: { id: generatorId },
            });
            if (!generator) {
                throw new common_1.NotFoundException('Gerador não encontrado');
            }
        }
        const consumer = await this.prisma.consumer.create({
            data: {
                cpfCnpj,
                generatorId,
                birthDate: birthDate ? new Date(birthDate) : null,
                arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
                representativeId,
                approvalStatus: enums_1.ConsumerApprovalStatus.PENDING,
                submittedByRepresentativeId: representativeId,
                ...consumerData,
            },
            include: {
                generator: true,
                Representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        await this.auditService.logRepresentativeCreate(representativeId, 'Consumer', consumer.id, {
            name: consumer.name,
            cpfCnpj: consumer.cpfCnpj,
            status: consumer.status,
            averageMonthlyConsumption: consumer.averageMonthlyConsumption,
            discountOffered: consumer.discountOffered,
        });
        return {
            ...consumer,
            message: 'Cadastro enviado para aprovação. Você será notificado quando for aprovado ou se houver ajustes necessários.'
        };
    }
    async findAll() {
        const consumers = await this.prisma.consumer.findMany({
            where: {
                OR: [
                    { approvalStatus: enums_1.ConsumerApprovalStatus.APPROVED },
                    { submittedByRepresentativeId: null },
                ],
            },
            include: {
                generator: {
                    select: {
                        id: true,
                        ownerName: true,
                        sourceType: true,
                        installedPower: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return consumers.map(consumer => {
            if (consumer.invoiceUrl && consumer.invoiceFileName) {
                return {
                    ...consumer,
                    invoiceUrl: `/consumers/${consumer.id}/invoice`,
                };
            }
            return consumer;
        });
    }
    async findOne(id) {
        const consumer = await this.prisma.consumer.findUnique({
            where: { id },
            include: {
                generator: true,
            },
        });
        if (!consumer) {
            throw new common_1.NotFoundException('Consumidor não encontrado');
        }
        if (consumer.invoiceUrl && consumer.invoiceFileName) {
            return {
                ...consumer,
                invoiceUrl: `/consumers/${id}/invoice`,
            };
        }
        return consumer;
    }
    async findByCpfCnpj(cpfCnpj) {
        const consumers = await this.prisma.consumer.findMany({
            where: { cpfCnpj },
            include: {
                generator: {
                    select: {
                        id: true,
                        ownerName: true,
                        sourceType: true,
                        installedPower: true,
                    },
                },
            },
        });
        return consumers;
    }
    async findByRepresentative(representativeId) {
        const consumers = await this.prisma.consumer.findMany({
            where: { representativeId },
            include: {
                generator: {
                    select: {
                        id: true,
                        ownerName: true,
                        sourceType: true,
                        installedPower: true,
                        status: true,
                    },
                },
                Representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return consumers.map(consumer => {
            if (consumer.invoiceUrl && consumer.invoiceFileName) {
                return {
                    ...consumer,
                    invoiceUrl: `/consumers/representative/${consumer.id}/invoice`,
                };
            }
            return consumer;
        });
    }
    async update(id, updateConsumerDto) {
        const { generatorId, birthDate, arrivalDate, ...updateData } = updateConsumerDto;
        await this.findOne(id);
        if (generatorId) {
            const generator = await this.prisma.generator.findUnique({
                where: { id: generatorId },
            });
            if (!generator) {
                throw new common_1.NotFoundException('Gerador não encontrado');
            }
        }
        const consumer = await this.prisma.consumer.update({
            where: { id },
            data: {
                generatorId,
                birthDate: birthDate ? new Date(birthDate) : undefined,
                arrivalDate: arrivalDate ? new Date(arrivalDate) : undefined,
                ...updateData,
            },
            include: {
                generator: true,
            },
        });
        return consumer;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.consumer.delete({
            where: { id },
        });
        return { message: 'Consumidor removido com sucesso' };
    }
    async allocateToGenerator(consumerId, generatorId, percentage) {
        const toAllocate = await this.findOne(consumerId);
        if (toAllocate.approvalStatus !== enums_1.ConsumerApprovalStatus.APPROVED) {
            throw new common_1.BadRequestException('Consumidor ainda não aprovado para alocação');
        }
        if (percentage <= 0 || percentage > 100) {
            throw new common_1.BadRequestException('Porcentagem deve estar entre 0 e 100');
        }
        const consumer = await this.findOne(consumerId);
        const generator = await this.prisma.generator.findUnique({
            where: { id: generatorId },
        });
        if (!generator) {
            throw new common_1.NotFoundException('Gerador não encontrado');
        }
        if (consumer.status === enums_1.ConsumerStatus.ALLOCATED) {
            throw new common_1.ConflictException('Consumidor já está alocado');
        }
        const updatedConsumer = await this.prisma.consumer.update({
            where: { id: consumerId },
            data: {
                status: enums_1.ConsumerStatus.ALLOCATED,
                generatorId,
                allocatedPercentage: percentage,
            },
            include: {
                generator: true,
            },
        });
        if (updatedConsumer.representativeId) {
            try {
                const existingCommission = await this.prisma.commission.findFirst({
                    where: {
                        consumerId: updatedConsumer.id,
                        representativeId: updatedConsumer.representativeId,
                    },
                });
                if (!existingCommission) {
                    await this.commissionsService.createCommissionForApprovedConsumer(consumerId);
                }
            }
            catch (error) {
                console.error('Erro ao criar comissão durante alocação:', error);
            }
        }
        return updatedConsumer;
    }
    async deallocate(consumerId) {
        const toDeallocate = await this.findOne(consumerId);
        if (toDeallocate.approvalStatus !== enums_1.ConsumerApprovalStatus.APPROVED) {
            throw new common_1.BadRequestException('Consumidor ainda não aprovado');
        }
        await this.findOne(consumerId);
        const updatedConsumer = await this.prisma.consumer.update({
            where: { id: consumerId },
            data: {
                status: enums_1.ConsumerStatus.AVAILABLE,
                generatorId: null,
                allocatedPercentage: null,
            },
        });
        return updatedConsumer;
    }
    async approveConsumer(consumerId, approverUserId) {
        const existing = await this.findOne(consumerId);
        const approved = await this.prisma.consumer.update({
            where: { id: consumerId },
            data: {
                approvalStatus: enums_1.ConsumerApprovalStatus.APPROVED,
                approvedByUserId: approverUserId,
                approvedAt: new Date(),
            },
        });
        if (approved.representativeId) {
            try {
                await this.commissionsService.createCommissionForApprovedConsumer(consumerId);
            }
            catch (error) {
                console.error('Erro ao criar comissão:', error);
            }
        }
        await this.auditService.log({
            userId: approverUserId,
            action: 'APPROVE',
            entityType: 'Consumer',
            entityId: consumerId,
            oldValues: existing,
            newValues: approved,
        });
        return approved;
    }
    async rejectConsumer(consumerId, approverUserId, reason) {
        const existing = await this.findOne(consumerId);
        const rejected = await this.prisma.consumer.update({
            where: { id: consumerId },
            data: {
                approvalStatus: enums_1.ConsumerApprovalStatus.REJECTED,
                approvedByUserId: approverUserId,
                approvedAt: new Date(),
                rejectionReason: reason || 'Sem motivo informado',
            },
        });
        await this.auditService.log({
            userId: approverUserId,
            action: 'REJECT',
            entityType: 'Consumer',
            entityId: consumerId,
            oldValues: existing,
            newValues: rejected,
        });
        return rejected;
    }
    async getByState(state) {
        const consumers = await this.prisma.consumer.findMany({
            where: {
                state,
                OR: [
                    { approvalStatus: enums_1.ConsumerApprovalStatus.APPROVED },
                    { submittedByRepresentativeId: null },
                ],
            },
            include: {
                generator: {
                    select: {
                        id: true,
                        ownerName: true,
                        sourceType: true,
                    },
                },
            },
        });
        return consumers;
    }
    async findPending(filters) {
        const { state, city, representativeId, startDate, endDate, page = 1, limit = 20 } = filters;
        const where = {
            approvalStatus: enums_1.ConsumerApprovalStatus.PENDING,
            submittedByRepresentativeId: {
                not: null,
            },
        };
        if (representativeId)
            where.representativeId = representativeId;
        if (state)
            where.state = state;
        if (city)
            where.city = { contains: city, mode: 'insensitive' };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = new Date(startDate);
            if (endDate)
                where.createdAt.lte = new Date(endDate);
        }
        const skip = (page - 1) * limit;
        const [consumers, total] = await Promise.all([
            this.prisma.consumer.findMany({
                where,
                include: {
                    Representative: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.consumer.count({ where }),
        ]);
        return {
            consumers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
        };
    }
    async getStatistics() {
        const total = await this.prisma.consumer.count();
        const allocated = await this.prisma.consumer.count({
            where: { status: enums_1.ConsumerStatus.ALLOCATED },
        });
        const available = await this.prisma.consumer.count({
            where: { status: enums_1.ConsumerStatus.AVAILABLE },
        });
        const totalConsumption = await this.prisma.consumer.aggregate({
            _sum: {
                averageMonthlyConsumption: true,
            },
        });
        const byState = await this.prisma.consumer.groupBy({
            by: ['state'],
            _count: {
                id: true,
            },
        });
        return {
            total,
            allocated,
            available,
            allocationRate: total > 0 ? (allocated / total) * 100 : 0,
            totalMonthlyConsumption: totalConsumption._sum.averageMonthlyConsumption || 0,
            distributionByState: byState,
        };
    }
    async findRepresentativeConsumer(representativeId, consumerId) {
        const consumer = await this.prisma.consumer.findFirst({
            where: {
                id: consumerId,
                representativeId
            },
            include: {
                generator: {
                    select: {
                        id: true,
                        ownerName: true,
                        sourceType: true,
                        installedPower: true,
                        status: true,
                        city: true,
                        state: true,
                        concessionaire: true,
                    },
                },
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
            throw new common_1.NotFoundException('Consumidor não encontrado ou não pertence ao representante');
        }
        if (consumer.invoiceUrl && consumer.invoiceFileName) {
            return {
                ...consumer,
                invoiceUrl: `/consumers/representative/${consumerId}/invoice`,
            };
        }
        return consumer;
        if (!consumer) {
            throw new common_1.NotFoundException('Consumidor não encontrado ou não pertence ao representante');
        }
        return consumer;
    }
    async findRepresentativeConsumersWithFilters(representativeId, filters) {
        const { status, approvalStatus, consumerType, state, city, startDate, endDate, page = 1, limit = 20 } = filters;
        const where = {
            representativeId,
        };
        if (status) {
            where.status = status;
        }
        if (approvalStatus) {
            where.approvalStatus = approvalStatus;
        }
        if (consumerType) {
            where.consumerType = consumerType;
        }
        if (state) {
            where.state = state;
        }
        if (city) {
            where.city = {
                contains: city,
                mode: 'insensitive',
            };
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
        const skip = (page - 1) * limit;
        const [consumers, total] = await Promise.all([
            this.prisma.consumer.findMany({
                where,
                include: {
                    generator: {
                        select: {
                            id: true,
                            ownerName: true,
                            sourceType: true,
                            installedPower: true,
                            status: true,
                            city: true,
                            state: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            this.prisma.consumer.count({ where }),
        ]);
        const stats = {
            totalConsumers: total,
            totalKwh: consumers.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0),
            allocatedKwh: consumers
                .filter(c => c.status === 'ALLOCATED' && c.allocatedPercentage)
                .reduce((sum, c) => sum + (c.averageMonthlyConsumption * (c.allocatedPercentage || 0) / 100), 0),
            pendingKwh: consumers
                .filter(c => c.status !== 'ALLOCATED')
                .reduce((sum, c) => sum + c.averageMonthlyConsumption, 0),
            statusBreakdown: {
                available: consumers.filter(c => c.status === 'AVAILABLE').length,
                allocated: consumers.filter(c => c.status === 'ALLOCATED').length,
                inProcess: consumers.filter(c => c.status === 'IN_PROCESS').length,
                converted: consumers.filter(c => c.status === 'CONVERTED').length,
            },
        };
        return {
            consumers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            },
            stats,
        };
    }
    async updateRepresentativeConsumerWithApproval(representativeId, consumerId, updateData) {
        const existingConsumer = await this.prisma.consumer.findFirst({
            where: {
                id: consumerId,
                representativeId
            },
        });
        if (!existingConsumer) {
            throw new common_1.NotFoundException('Consumidor não encontrado ou não pertence ao representante');
        }
        const criticalFields = [
            'averageMonthlyConsumption',
            'discountOffered',
            'ucNumber',
            'concessionaire',
            'consumerType',
            'phase',
            'status',
            'allocatedPercentage',
            'generatorId',
        ];
        const criticalUpdates = {};
        const nonCriticalUpdates = {};
        const { birthDate, arrivalDate, ...restFields } = updateData;
        Object.keys(restFields).forEach((key) => {
            if (restFields[key] !== undefined && restFields[key] !== null) {
                if (criticalFields.includes(key)) {
                    criticalUpdates[key] = restFields[key];
                }
                else {
                    nonCriticalUpdates[key] = restFields[key];
                }
            }
        });
        if (birthDate) {
            nonCriticalUpdates.birthDate = new Date(birthDate);
        }
        if (arrivalDate) {
            nonCriticalUpdates.arrivalDate = new Date(arrivalDate);
        }
        let updatedConsumer = existingConsumer;
        let changeRequest = null;
        if (Object.keys(nonCriticalUpdates).length > 0) {
            updatedConsumer = await this.prisma.consumer.update({
                where: { id: consumerId },
                data: nonCriticalUpdates,
                include: {
                    generator: {
                        select: {
                            id: true,
                            ownerName: true,
                            sourceType: true,
                            installedPower: true,
                            status: true,
                        },
                    },
                    Representative: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            });
            await this.auditService.logRepresentativeUpdate(representativeId, 'Consumer', consumerId, existingConsumer, nonCriticalUpdates);
        }
        if (Object.keys(criticalUpdates).length > 0) {
            changeRequest = await this.changeRequestsService.createChangeRequest(consumerId, representativeId, criticalUpdates);
        }
        return {
            consumer: updatedConsumer,
            changeRequest,
            message: Object.keys(nonCriticalUpdates).length > 0 && Object.keys(criticalUpdates).length > 0
                ? 'Campos não críticos atualizados. Campos críticos aguardam aprovação.'
                : Object.keys(criticalUpdates).length > 0
                    ? 'Solicitação de alteração criada. Aguarde aprovação do administrador.'
                    : 'Consumidor atualizado com sucesso.',
            updatedFields: {
                direct: Object.keys(nonCriticalUpdates),
                pending: Object.keys(criticalUpdates),
            },
        };
    }
    async updateRepresentativeConsumer(representativeId, consumerId, updateData) {
        return this.updateRepresentativeConsumerWithApproval(representativeId, consumerId, updateData);
    }
    async getRepresentativeConsumerStats(representativeId) {
        const consumers = await this.prisma.consumer.findMany({
            where: { representativeId },
            select: {
                status: true,
                averageMonthlyConsumption: true,
                allocatedPercentage: true,
                consumerType: true,
                state: true,
                city: true,
                createdAt: true,
                discountOffered: true,
            },
        });
        if (consumers.length === 0) {
            return {
                totalConsumers: 0,
                totalKwh: 0,
                allocatedKwh: 0,
                pendingKwh: 0,
                allocationRate: 0,
                averageDiscount: 0,
                statusBreakdown: {
                    available: 0,
                    allocated: 0,
                    inProcess: 0,
                    converted: 0,
                },
                typeBreakdown: {},
                stateBreakdown: {},
                monthlyEvolution: [],
            };
        }
        const totalKwh = consumers.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0);
        const allocatedKwh = consumers
            .filter(c => c.status === 'ALLOCATED' && c.allocatedPercentage)
            .reduce((sum, c) => sum + (c.averageMonthlyConsumption * (c.allocatedPercentage || 0) / 100), 0);
        const averageDiscount = consumers.reduce((sum, c) => sum + c.discountOffered, 0) / consumers.length;
        const statusBreakdown = consumers.reduce((acc, c) => {
            acc[c.status.toLowerCase()] = (acc[c.status.toLowerCase()] || 0) + 1;
            return acc;
        }, {});
        const typeBreakdown = consumers.reduce((acc, c) => {
            acc[c.consumerType] = (acc[c.consumerType] || 0) + 1;
            return acc;
        }, {});
        const stateBreakdown = consumers.reduce((acc, c) => {
            acc[c.state] = (acc[c.state] || 0) + 1;
            return acc;
        }, {});
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyEvolution = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const monthConsumers = consumers.filter(c => {
                const consumerDate = new Date(c.createdAt);
                return consumerDate >= monthStart && consumerDate <= monthEnd;
            });
            monthlyEvolution.push({
                month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                count: monthConsumers.length,
                kwh: monthConsumers.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0),
            });
        }
        return {
            totalConsumers: consumers.length,
            totalKwh: Math.round(totalKwh * 100) / 100,
            allocatedKwh: Math.round(allocatedKwh * 100) / 100,
            pendingKwh: Math.round((totalKwh - allocatedKwh) * 100) / 100,
            allocationRate: totalKwh > 0 ? Math.round((allocatedKwh / totalKwh) * 100 * 100) / 100 : 0,
            averageDiscount: Math.round(averageDiscount * 100) / 100,
            statusBreakdown,
            typeBreakdown,
            stateBreakdown,
            monthlyEvolution,
        };
    }
    async generateCommissionsForApprovedConsumers() {
        console.log('🔍 [DEBUG] Iniciando geração de comissões...');
        const consumersWithoutCommission = await this.prisma.consumer.findMany({
            where: {
                approvalStatus: enums_1.ConsumerApprovalStatus.APPROVED,
                representativeId: {
                    not: null,
                },
                generatorId: {
                    not: null,
                },
                commissions: {
                    none: {},
                },
            },
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
        console.log(`🔍 [DEBUG] Consumidores encontrados: ${consumersWithoutCommission.length}`);
        console.log(`🔍 [DEBUG] Critérios: aprovados + representante + alocados a gerador + sem comissão`);
        consumersWithoutCommission.forEach((consumer, index) => {
            console.log(`🔍 [DEBUG] Consumidor ${index + 1}:`, {
                id: consumer.id,
                name: consumer.name,
                representativeId: consumer.representativeId,
                representativeName: 'N/A',
                generatorId: consumer.generatorId,
                averageMonthlyConsumption: consumer.averageMonthlyConsumption,
                approvalStatus: consumer.approvalStatus
            });
        });
        const results = [];
        for (const consumer of consumersWithoutCommission) {
            try {
                const commission = await this.commissionsService.createCommissionForApprovedConsumer(consumer.id);
                results.push({
                    consumerId: consumer.id,
                    consumerName: consumer.name,
                    representativeId: consumer.representativeId,
                    representativeName: 'N/A',
                    commissionValue: commission.commissionValue,
                    status: 'SUCCESS',
                });
            }
            catch (error) {
                results.push({
                    consumerId: consumer.id,
                    consumerName: consumer.name,
                    representativeId: consumer.representativeId,
                    representativeName: 'N/A',
                    status: 'ERROR',
                    error: error.message,
                });
            }
        }
        console.log(`🔍 [DEBUG] Resultado final:`, {
            totalProcessed: consumersWithoutCommission.length,
            successful: results.filter(r => r.status === 'SUCCESS').length,
            errors: results.filter(r => r.status === 'ERROR').length,
        });
        return {
            totalProcessed: consumersWithoutCommission.length,
            successful: results.filter(r => r.status === 'SUCCESS').length,
            errors: results.filter(r => r.status === 'ERROR').length,
            results,
        };
    }
    async generateCommissionsForApprovedConsumersWithoutAllocation() {
        console.log('🔍 [DEBUG] Iniciando geração de comissões (SEM alocação obrigatória)...');
        const consumersWithoutCommission = await this.prisma.consumer.findMany({
            where: {
                approvalStatus: enums_1.ConsumerApprovalStatus.APPROVED,
                representativeId: {
                    not: null,
                },
                commissions: {
                    none: {},
                },
            },
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
        console.log(`🔍 [DEBUG] Consumidores encontrados (sem alocação obrigatória): ${consumersWithoutCommission.length}`);
        console.log(`🔍 [DEBUG] Critérios: aprovados + representante + sem comissão (alocação opcional)`);
        consumersWithoutCommission.forEach((consumer, index) => {
            console.log(`🔍 [DEBUG] Consumidor ${index + 1}:`, {
                id: consumer.id,
                name: consumer.name,
                representativeId: consumer.representativeId,
                representativeName: 'N/A',
                generatorId: consumer.generatorId,
                averageMonthlyConsumption: consumer.averageMonthlyConsumption,
                approvalStatus: consumer.approvalStatus
            });
        });
        const results = [];
        for (const consumer of consumersWithoutCommission) {
            try {
                const commission = await this.commissionsService.createCommissionForApprovedConsumer(consumer.id);
                results.push({
                    consumerId: consumer.id,
                    consumerName: consumer.name,
                    representativeId: consumer.representativeId,
                    representativeName: 'N/A',
                    commissionValue: commission.commissionValue,
                    status: 'SUCCESS',
                });
            }
            catch (error) {
                results.push({
                    consumerId: consumer.id,
                    consumerName: consumer.name,
                    representativeId: consumer.representativeId,
                    representativeName: 'N/A',
                    status: 'ERROR',
                    error: error.message,
                });
            }
        }
        console.log(`🔍 [DEBUG] Resultado final (sem alocação):`, {
            totalProcessed: consumersWithoutCommission.length,
            successful: results.filter(r => r.status === 'SUCCESS').length,
            errors: results.filter(r => r.status === 'ERROR').length,
        });
        return {
            totalProcessed: consumersWithoutCommission.length,
            successful: results.filter(r => r.status === 'SUCCESS').length,
            errors: results.filter(r => r.status === 'ERROR').length,
            results,
        };
    }
    async debugEligibleConsumers() {
        console.log('🔍 [DEBUG] Iniciando análise de consumidores elegíveis...');
        const totalConsumers = await this.prisma.consumer.count();
        const approvedConsumers = await this.prisma.consumer.count({
            where: {
                approvalStatus: enums_1.ConsumerApprovalStatus.APPROVED,
            },
        });
        console.log(`🔍 [DEBUG] Total de consumidores: ${totalConsumers}`);
        console.log(`🔍 [DEBUG] Consumidores aprovados: ${approvedConsumers}`);
        const approvedWithRepresentative = await this.prisma.consumer.count({
            where: {
                approvalStatus: enums_1.ConsumerApprovalStatus.APPROVED,
                representativeId: {
                    not: null,
                },
            },
        });
        console.log(`🔍 [DEBUG] Consumidores aprovados com representante: ${approvedWithRepresentative}`);
        const approvedWithRepresentativeAndAllocated = await this.prisma.consumer.count({
            where: {
                approvalStatus: enums_1.ConsumerApprovalStatus.APPROVED,
                representativeId: {
                    not: null,
                },
                generatorId: {
                    not: null,
                },
            },
        });
        console.log(`🔍 [DEBUG] Consumidores aprovados com representante E alocados: ${approvedWithRepresentativeAndAllocated}`);
        const eligibleForCommission = await this.prisma.consumer.findMany({
            where: {
                approvalStatus: enums_1.ConsumerApprovalStatus.APPROVED,
                representativeId: {
                    not: null,
                },
                generatorId: {
                    not: null,
                },
                commissions: {
                    none: {},
                },
            },
            include: {
                Representative: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                generator: {
                    select: {
                        id: true,
                        ownerName: true,
                    },
                },
            },
        });
        const withCommission = await this.prisma.consumer.count({
            where: {
                approvalStatus: enums_1.ConsumerApprovalStatus.APPROVED,
                representativeId: {
                    not: null,
                },
                generatorId: {
                    not: null,
                },
                commissions: {
                    some: {},
                },
            },
        });
        return {
            summary: {
                totalConsumers,
                approvedConsumers,
                approvedWithRepresentative,
                approvedWithRepresentativeAndAllocated,
                withCommission,
                eligibleForCommission: eligibleForCommission.length,
            },
            eligibleConsumers: eligibleForCommission.map(consumer => ({
                id: consumer.id,
                name: consumer.name,
                cpfCnpj: consumer.cpfCnpj,
                averageMonthlyConsumption: consumer.averageMonthlyConsumption,
                representative: consumer.Representative,
                generator: consumer.generator,
                status: consumer.status,
                approvalStatus: consumer.approvalStatus,
                approvedAt: consumer.approvedAt,
            })),
        };
    }
    async getConsumerActivityHistory(representativeId, consumerId) {
        const consumer = await this.prisma.consumer.findFirst({
            where: {
                id: consumerId,
                representativeId
            },
        });
        if (!consumer) {
            throw new common_1.NotFoundException('Consumidor não encontrado ou não pertence ao representante');
        }
        const auditLogs = await this.prisma.auditLog.findMany({
            where: {
                entityType: 'Consumer',
                entityId: consumerId,
            },
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
        });
        const formattedLogs = auditLogs.map(log => {
            let description = '';
            let icon = '';
            let color = '';
            switch (log.action) {
                case 'CREATE':
                    description = 'Consumidor foi cadastrado';
                    icon = 'user-plus';
                    color = 'green';
                    break;
                case 'UPDATE':
                    description = 'Dados do consumidor foram atualizados';
                    icon = 'edit';
                    color = 'blue';
                    break;
                case 'STATUS_CHANGE':
                    description = 'Status do consumidor foi alterado';
                    icon = 'refresh';
                    color = 'orange';
                    break;
                case 'ALLOCATE':
                    description = 'Consumidor foi alocado a um gerador';
                    icon = 'link';
                    color = 'purple';
                    break;
                case 'DEALLOCATE':
                    description = 'Consumidor foi desalocado do gerador';
                    icon = 'unlink';
                    color = 'red';
                    break;
                default:
                    description = `Ação: ${log.action}`;
                    icon = 'activity';
                    color = 'gray';
            }
            if (log.newValues) {
                const newValues = log.newValues;
                if (newValues.status) {
                    description += ` para "${newValues.status}"`;
                }
                if (newValues.name && log.action === 'CREATE') {
                    description += ` - ${newValues.name}`;
                }
            }
            return {
                id: log.id,
                action: log.action,
                description,
                icon,
                color,
                timestamp: log.createdAt,
                user: log.user ? {
                    id: log.user.id,
                    name: log.user.name,
                    email: log.user.email,
                    role: log.user.role,
                } : null,
                oldValues: log.oldValues,
                newValues: log.newValues,
                metadata: log.metadata,
                ipAddress: log.ipAddress,
            };
        });
        return {
            consumer: {
                id: consumer.id,
                name: consumer.name,
                cpfCnpj: consumer.cpfCnpj,
                status: consumer.status,
            },
            activities: formattedLogs,
            totalActivities: formattedLogs.length,
        };
    }
    async createTestConsumer() {
        console.log('🔍 [DEBUG] Criando consumidor de teste...');
        const representative = await this.prisma.representative.findFirst({
            where: {
                status: 'ACTIVE',
            },
        });
        if (!representative) {
            throw new Error('Nenhum representante ativo encontrado');
        }
        console.log(`🔍 [DEBUG] Usando representante: ${representative.name} (${representative.id})`);
        const testConsumer = await this.prisma.consumer.create({
            data: {
                name: 'Consumidor Teste Comissão',
                cpfCnpj: '123.456.789-00',
                email: 'teste@comissao.com',
                phone: '11999999999',
                street: 'Rua Teste',
                number: '123',
                city: 'São Paulo',
                state: 'SP',
                zipCode: '01234-567',
                averageMonthlyConsumption: 500,
                consumerType: 'RESIDENTIAL',
                status: 'AVAILABLE',
                approvalStatus: 'APPROVED',
                representativeId: representative.id,
                concessionaire: 'CPFL',
                ucNumber: '123456789',
                phase: 'MONOPHASIC',
                discountOffered: 0,
                generatorId: null,
            },
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
        console.log(`🔍 [DEBUG] Consumidor de teste criado:`, {
            id: testConsumer.id,
            name: testConsumer.name,
            representativeId: testConsumer.representativeId,
            averageMonthlyConsumption: testConsumer.averageMonthlyConsumption,
            approvalStatus: testConsumer.approvalStatus,
            generatorId: testConsumer.generatorId,
        });
        return {
            message: 'Consumidor de teste criado com sucesso',
            consumer: testConsumer,
        };
    }
    async generateCommissionForConsumer(consumerId) {
        console.log(`🔍 [DEBUG] Gerando comissão para consumidor específico: ${consumerId}`);
        try {
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
                throw new Error('Consumidor não encontrado');
            }
            console.log(`🔍 [DEBUG] Consumidor encontrado:`, {
                id: consumer.id,
                name: consumer.name,
                representativeId: consumer.representativeId,
                representativeName: 'N/A',
                approvalStatus: consumer.approvalStatus,
                averageMonthlyConsumption: consumer.averageMonthlyConsumption,
                generatorId: consumer.generatorId,
            });
            const existingCommission = await this.prisma.commission.findFirst({
                where: {
                    consumerId: consumer.id,
                    representativeId: consumer.representativeId || undefined,
                },
            });
            if (existingCommission) {
                console.log(`🔍 [DEBUG] Consumidor já tem comissão: ${existingCommission.id}`);
                return {
                    totalProcessed: 0,
                    successful: 0,
                    errors: 1,
                    results: [{
                            consumerId: consumer.id,
                            consumerName: consumer.name,
                            representativeId: consumer.representativeId,
                            representativeName: 'N/A',
                            commissionValue: existingCommission.commissionValue,
                            status: 'ERROR',
                            error: 'Comissão já existe para este consumidor',
                        }],
                };
            }
            const commission = await this.commissionsService.createCommissionForApprovedConsumer(consumerId);
            console.log(`🔍 [DEBUG] Comissão gerada com sucesso:`, {
                id: commission.id,
                value: commission.commissionValue,
                consumerId: commission.consumerId,
                representativeId: commission.representativeId,
            });
            return {
                totalProcessed: 1,
                successful: 1,
                errors: 0,
                results: [{
                        consumerId: consumer.id,
                        consumerName: consumer.name,
                        representativeId: consumer.representativeId,
                        representativeName: 'N/A',
                        commissionValue: commission.commissionValue,
                        status: 'SUCCESS',
                    }],
            };
        }
        catch (error) {
            console.error(`🔍 [DEBUG] Erro ao gerar comissão:`, error.message);
            return {
                totalProcessed: 1,
                successful: 0,
                errors: 1,
                results: [{
                        consumerId: consumerId,
                        consumerName: 'N/A',
                        representativeId: null,
                        representativeName: 'N/A',
                        commissionValue: 0,
                        status: 'ERROR',
                        error: error.message,
                    }],
            };
        }
    }
    async uploadInvoice(consumerId, representativeId, file) {
        const consumer = await this.prisma.consumer.findUnique({
            where: { id: consumerId },
        });
        if (!consumer) {
            throw new common_1.NotFoundException('Consumidor não encontrado');
        }
        if (consumer.representativeId !== representativeId) {
            throw new common_1.ForbiddenException('Você só pode fazer upload de faturas para consumidores que você criou');
        }
        const fileExtension = file.originalname.split('.').pop();
        const timestamp = new Date().toISOString().split('T')[0];
        const consumerName = consumer.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '-')
            .toLowerCase()
            .substring(0, 30);
        const friendlyFileName = `${consumerName}-${timestamp}.${fileExtension}`;
        const storageFileName = `fatura-${consumerId}-${Date.now()}.${fileExtension}`;
        const folder = `consumers/${consumerId}`;
        const { url, path } = await this.supabaseStorage.uploadFile(file, storageFileName, folder);
        if (consumer.invoiceUrl) {
            this.supabaseStorage.deleteFile(consumer.invoiceFileName || '').catch((error) => {
                console.error('Erro ao remover fatura anterior:', error);
            });
        }
        const updatedConsumer = await this.prisma.consumer.update({
            where: { id: consumerId },
            data: {
                invoiceUrl: url,
                invoiceFileName: path,
                invoiceUploadedAt: new Date(),
                invoiceScannedData: {
                    friendlyFileName: friendlyFileName,
                    processing: true,
                },
            },
        });
        let scannedData = null;
        if (file.mimetype.startsWith('image/')) {
            this.processOcrAsync(consumerId, file.buffer, friendlyFileName).catch((error) => {
                console.error('Erro ao processar OCR em background:', error);
            });
        }
        else {
            await this.prisma.consumer.update({
                where: { id: consumerId },
                data: {
                    invoiceScannedData: {
                        friendlyFileName: friendlyFileName,
                        processing: false,
                    },
                },
            });
        }
        this.auditService.log({
            representativeId: representativeId,
            action: 'UPLOAD_INVOICE',
            entityType: 'Consumer',
            entityId: consumerId,
            metadata: {
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                isImage: file.mimetype.startsWith('image/'),
            },
        }).catch((error) => {
            console.error('Erro ao registrar log de auditoria:', error);
        });
        const backendUrl = `/consumers/representative/${consumerId}/invoice`;
        return {
            consumer: updatedConsumer,
            invoiceUrl: backendUrl,
            invoiceStorageUrl: url,
            invoiceFileName: friendlyFileName,
            scannedData: file.mimetype.startsWith('image/')
                ? { processing: true }
                : null,
        };
    }
    async processOcrAsync(consumerId, imageBuffer, friendlyFileName) {
        try {
            const ocrResult = await this.ocrService.extractTextFromImage(imageBuffer);
            const scannedData = {
                text: ocrResult.text,
                confidence: ocrResult.confidence,
                extractedData: ocrResult.data,
                friendlyFileName: friendlyFileName,
                processing: false,
                processedAt: new Date().toISOString(),
            };
            await this.prisma.consumer.update({
                where: { id: consumerId },
                data: {
                    invoiceScannedData: scannedData,
                },
            });
            console.log(`OCR processado com sucesso para consumidor ${consumerId}`);
        }
        catch (error) {
            console.error(`Erro ao processar OCR para consumidor ${consumerId}:`, error);
            await this.prisma.consumer.update({
                where: { id: consumerId },
                data: {
                    invoiceScannedData: {
                        friendlyFileName: friendlyFileName,
                        processing: false,
                        error: 'Erro ao processar OCR',
                    },
                },
            });
        }
    }
    async removeInvoice(consumerId, representativeId) {
        const consumer = await this.prisma.consumer.findUnique({
            where: { id: consumerId },
        });
        if (!consumer) {
            throw new common_1.NotFoundException('Consumidor não encontrado');
        }
        if (consumer.representativeId !== representativeId) {
            throw new common_1.ForbiddenException('Você só pode remover faturas de consumidores que você criou');
        }
        if (!consumer.invoiceUrl) {
            throw new common_1.BadRequestException('Este consumidor não possui fatura anexada');
        }
        if (consumer.invoiceFileName) {
            try {
                await this.supabaseStorage.deleteFile(consumer.invoiceFileName);
            }
            catch (error) {
                console.error('Erro ao remover arquivo do storage:', error);
            }
        }
        const updatedConsumer = await this.prisma.consumer.update({
            where: { id: consumerId },
            data: {
                invoiceUrl: null,
                invoiceFileName: null,
                invoiceUploadedAt: null,
                invoiceScannedData: client_1.Prisma.DbNull,
            },
        });
        await this.auditService.log({
            representativeId: representativeId,
            action: 'REMOVE_INVOICE',
            entityType: 'Consumer',
            entityId: consumerId,
        });
        return updatedConsumer;
    }
    async downloadInvoice(consumerId, representativeId, res) {
        const consumer = await this.prisma.consumer.findUnique({
            where: { id: consumerId },
        });
        if (!consumer) {
            throw new common_1.NotFoundException('Consumidor não encontrado');
        }
        if (consumer.representativeId !== representativeId) {
            throw new common_1.ForbiddenException('Você só pode fazer download de faturas de consumidores que você criou');
        }
        if (!consumer.invoiceFileName) {
            throw new common_1.NotFoundException('Este consumidor não possui fatura anexada');
        }
        const fileBuffer = await this.supabaseStorage.downloadFile(consumer.invoiceFileName);
        const extension = consumer.invoiceFileName.split('.').pop()?.toLowerCase();
        const contentTypeMap = {
            pdf: 'application/pdf',
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
        };
        const contentType = contentTypeMap[extension || ''] || 'application/octet-stream';
        const friendlyName = this.getFriendlyInvoiceName(consumer);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${friendlyName}"`);
        res.send(fileBuffer);
    }
    async downloadInvoiceAdmin(consumerId, res) {
        try {
            const consumer = await this.prisma.consumer.findUnique({
                where: { id: consumerId },
            });
            if (!consumer) {
                throw new common_1.NotFoundException('Consumidor não encontrado');
            }
            if (!consumer.invoiceFileName) {
                throw new common_1.NotFoundException('Este consumidor não possui fatura anexada');
            }
            console.log(`[downloadInvoiceAdmin] Tentando fazer download do arquivo: ${consumer.invoiceFileName}`);
            const fileBuffer = await this.supabaseStorage.downloadFile(consumer.invoiceFileName);
            const extension = consumer.invoiceFileName.split('.').pop()?.toLowerCase();
            const contentTypeMap = {
                pdf: 'application/pdf',
                jpg: 'image/jpeg',
                jpeg: 'image/jpeg',
                png: 'image/png',
                webp: 'image/webp',
            };
            const contentType = contentTypeMap[extension || ''] || 'application/octet-stream';
            const friendlyName = this.getFriendlyInvoiceName(consumer);
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${friendlyName}"`);
            res.send(fileBuffer);
        }
        catch (error) {
            if (error.message?.includes('Bucket') || error.message?.includes('bucket')) {
                throw new common_1.NotFoundException(`Erro ao acessar a fatura: ${error.message}. Verifique se o bucket 'faturas-representantes' está configurado corretamente no Supabase.`);
            }
            throw error;
        }
    }
    getFriendlyInvoiceName(consumer) {
        if (consumer.invoiceScannedData?.friendlyFileName) {
            return consumer.invoiceScannedData.friendlyFileName;
        }
        const extension = consumer.invoiceFileName?.split('.').pop() || 'pdf';
        const consumerName = consumer.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '-')
            .toLowerCase()
            .substring(0, 30);
        const date = consumer.invoiceUploadedAt
            ? new Date(consumer.invoiceUploadedAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
        return `Fatura-${consumerName}-${date}.${extension}`;
    }
};
exports.ConsumersService = ConsumersService;
exports.ConsumersService = ConsumersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        commissions_service_1.CommissionsService,
        supabase_storage_service_1.SupabaseStorageService,
        ocr_service_1.OcrService,
        consumer_change_requests_service_1.ConsumerChangeRequestsService])
], ConsumersService);
//# sourceMappingURL=consumers.service.js.map