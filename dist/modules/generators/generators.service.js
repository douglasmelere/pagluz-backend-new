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
exports.GeneratorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const client_1 = require("@prisma/client");
let GeneratorsService = class GeneratorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createGeneratorDto) {
        const { cpfCnpj, ...generatorData } = createGeneratorDto;
        const generator = await this.prisma.generator.create({
            data: {
                cpfCnpj,
                ...generatorData,
            },
            include: {
                consumers: true,
            },
        });
        return this.calculateAllocationPercentages(generator);
    }
    async findAll() {
        const generators = await this.prisma.generator.findMany({
            include: {
                consumers: {
                    select: {
                        id: true,
                        name: true,
                        allocatedPercentage: true,
                        averageMonthlyConsumption: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return generators.map(generator => this.calculateAllocationPercentages(generator));
    }
    async findOne(id) {
        const generator = await this.prisma.generator.findUnique({
            where: { id },
            include: {
                consumers: true,
            },
        });
        if (!generator) {
            throw new common_1.NotFoundException('Gerador não encontrado');
        }
        return this.calculateAllocationPercentages(generator);
    }
    async update(id, updateGeneratorDto) {
        await this.findOne(id);
        const generator = await this.prisma.generator.update({
            where: { id },
            data: updateGeneratorDto,
            include: {
                consumers: true,
            },
        });
        return this.calculateAllocationPercentages(generator);
    }
    async remove(id) {
        const generator = await this.findOne(id);
        if (generator.consumers && generator.consumers.length > 0) {
            throw new common_1.ConflictException('Não é possível remover um gerador que possui consumidores alocados');
        }
        await this.prisma.generator.delete({
            where: { id },
        });
        return { message: 'Gerador removido com sucesso' };
    }
    async getByState(state) {
        const generators = await this.prisma.generator.findMany({
            where: { state },
            include: {
                consumers: {
                    select: {
                        id: true,
                        name: true,
                        allocatedPercentage: true,
                    },
                },
            },
        });
        return generators.map(generator => this.calculateAllocationPercentages(generator));
    }
    async getBySourceType(sourceType) {
        const generators = await this.prisma.generator.findMany({
            where: { sourceType: sourceType },
            include: {
                consumers: {
                    select: {
                        id: true,
                        name: true,
                        allocatedPercentage: true,
                    },
                },
            },
        });
        return generators.map(generator => this.calculateAllocationPercentages(generator));
    }
    async getStatistics() {
        const total = await this.prisma.generator.count();
        const underAnalysis = await this.prisma.generator.count({
            where: { status: client_1.GeneratorStatus.UNDER_ANALYSIS },
        });
        const awaitingAllocation = await this.prisma.generator.count({
            where: { status: client_1.GeneratorStatus.AWAITING_ALLOCATION },
        });
        const totalInstalledPower = await this.prisma.generator.aggregate({
            _sum: {
                installedPower: true,
            },
        });
        const byState = await this.prisma.generator.groupBy({
            by: ['state'],
            _count: {
                id: true,
            },
            _sum: {
                installedPower: true,
            },
        });
        const bySourceType = await this.prisma.generator.groupBy({
            by: ['sourceType'],
            _count: {
                id: true,
            },
            _sum: {
                installedPower: true,
            },
        });
        const allocatedConsumers = await this.prisma.consumer.findMany({
            where: {
                generatorId: { not: null },
                allocatedPercentage: { not: null },
            },
            include: {
                generator: true,
            },
        });
        let totalAllocatedCapacity = 0;
        allocatedConsumers.forEach(consumer => {
            if (consumer.generator && consumer.allocatedPercentage) {
                totalAllocatedCapacity += (consumer.generator.installedPower * consumer.allocatedPercentage) / 100;
            }
        });
        const totalCapacity = totalInstalledPower._sum.installedPower || 0;
        const allocationRate = totalCapacity > 0 ? (totalAllocatedCapacity / totalCapacity) * 100 : 0;
        return {
            total,
            underAnalysis,
            awaitingAllocation,
            totalInstalledPower: totalCapacity,
            totalAllocatedCapacity,
            availableCapacity: totalCapacity - totalAllocatedCapacity,
            allocationRate,
            distributionByState: byState,
            distributionBySourceType: bySourceType,
        };
    }
    calculateAllocationPercentages(generator) {
        if (!generator.consumers || generator.consumers.length === 0) {
            return {
                ...generator,
                allocatedPercentage: 0,
                availablePercentage: 100,
                allocatedCapacity: 0,
                availableCapacity: generator.installedPower,
            };
        }
        const totalAllocatedPercentage = generator.consumers.reduce((sum, consumer) => sum + (consumer.allocatedPercentage || 0), 0);
        const allocatedCapacity = (generator.installedPower * totalAllocatedPercentage) / 100;
        const availableCapacity = generator.installedPower - allocatedCapacity;
        return {
            ...generator,
            allocatedPercentage: Math.min(totalAllocatedPercentage, 100),
            availablePercentage: Math.max(100 - totalAllocatedPercentage, 0),
            allocatedCapacity,
            availableCapacity: Math.max(availableCapacity, 0),
        };
    }
};
exports.GeneratorsService = GeneratorsService;
exports.GeneratorsService = GeneratorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GeneratorsService);
//# sourceMappingURL=generators.service.js.map