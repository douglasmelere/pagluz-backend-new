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
let ConsumersService = class ConsumersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createConsumerDto) {
        const { cpfCnpj, generatorId, ...consumerData } = createConsumerDto;
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
                ...consumerData,
            },
            include: {
                generator: true,
            },
        });
        return consumer;
    }
    async createAsRepresentative(createConsumerDto, representativeId) {
        const { cpfCnpj, generatorId, ...consumerData } = createConsumerDto;
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
                representativeId,
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
        return consumer;
    }
    async findAll() {
        const consumers = await this.prisma.consumer.findMany({
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
        return consumers;
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
        return consumers;
    }
    async update(id, updateConsumerDto) {
        const { generatorId, ...updateData } = updateConsumerDto;
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
        if (consumer.status === client_1.ConsumerStatus.ALLOCATED) {
            throw new common_1.ConflictException('Consumidor já está alocado');
        }
        const updatedConsumer = await this.prisma.consumer.update({
            where: { id: consumerId },
            data: {
                status: client_1.ConsumerStatus.ALLOCATED,
                generatorId,
                allocatedPercentage: percentage,
            },
            include: {
                generator: true,
            },
        });
        return updatedConsumer;
    }
    async deallocate(consumerId) {
        await this.findOne(consumerId);
        const updatedConsumer = await this.prisma.consumer.update({
            where: { id: consumerId },
            data: {
                status: client_1.ConsumerStatus.AVAILABLE,
                generatorId: null,
                allocatedPercentage: null,
            },
        });
        return updatedConsumer;
    }
    async getByState(state) {
        const consumers = await this.prisma.consumer.findMany({
            where: { state },
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
    async getStatistics() {
        const total = await this.prisma.consumer.count();
        const allocated = await this.prisma.consumer.count({
            where: { status: client_1.ConsumerStatus.ALLOCATED },
        });
        const available = await this.prisma.consumer.count({
            where: { status: client_1.ConsumerStatus.AVAILABLE },
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
};
exports.ConsumersService = ConsumersService;
exports.ConsumersService = ConsumersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConsumersService);
//# sourceMappingURL=consumers.service.js.map