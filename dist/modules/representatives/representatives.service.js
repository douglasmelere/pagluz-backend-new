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
exports.RepresentativesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const bcrypt = require("bcryptjs");
let RepresentativesService = class RepresentativesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRepresentativeDto) {
        const existingEmail = await this.prisma.representative.findUnique({
            where: { email: createRepresentativeDto.email },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('Já existe um representante com este e-mail');
        }
        const existingCpfCnpj = await this.prisma.representative.findUnique({
            where: { cpfCnpj: createRepresentativeDto.cpfCnpj },
        });
        if (existingCpfCnpj) {
            throw new common_1.ConflictException('Já existe um representante com este CPF/CNPJ');
        }
        const hashedPassword = await bcrypt.hash(createRepresentativeDto.password, 10);
        return this.prisma.representative.create({
            data: {
                ...createRepresentativeDto,
                password: hashedPassword,
                specializations: createRepresentativeDto.specializations || [],
                status: createRepresentativeDto.status || 'PENDING_APPROVAL',
            },
            select: {
                id: true,
                name: true,
                cpfCnpj: true,
                email: true,
                phone: true,
                city: true,
                state: true,
                specializations: true,
                status: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
                loginCount: true,
            },
        });
    }
    async findAll() {
        return this.prisma.representative.findMany({
            select: {
                id: true,
                name: true,
                cpfCnpj: true,
                email: true,
                phone: true,
                city: true,
                state: true,
                specializations: true,
                status: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
                loginCount: true,
                _count: {
                    select: {
                        Consumer: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const representative = await this.prisma.representative.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                cpfCnpj: true,
                email: true,
                phone: true,
                city: true,
                state: true,
                specializations: true,
                status: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
                loginCount: true,
                Consumer: {
                    select: {
                        id: true,
                        name: true,
                        cpfCnpj: true,
                        status: true,
                        averageMonthlyConsumption: true,
                        allocatedPercentage: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        Consumer: true,
                    },
                },
            },
        });
        if (!representative) {
            throw new common_1.NotFoundException('Representante não encontrado');
        }
        return representative;
    }
    async findByEmail(email) {
        return this.prisma.representative.findUnique({
            where: { email },
        });
    }
    async update(id, updateRepresentativeDto) {
        const existingRepresentative = await this.prisma.representative.findUnique({
            where: { id },
        });
        if (!existingRepresentative) {
            throw new common_1.NotFoundException('Representante não encontrado');
        }
        if (updateRepresentativeDto.email && updateRepresentativeDto.email !== existingRepresentative.email) {
            const existingEmail = await this.prisma.representative.findUnique({
                where: { email: updateRepresentativeDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Já existe um representante com este e-mail');
            }
        }
        if (updateRepresentativeDto.cpfCnpj && updateRepresentativeDto.cpfCnpj !== existingRepresentative.cpfCnpj) {
            const existingCpfCnpj = await this.prisma.representative.findUnique({
                where: { cpfCnpj: updateRepresentativeDto.cpfCnpj },
            });
            if (existingCpfCnpj) {
                throw new common_1.ConflictException('Já existe um representante com este CPF/CNPJ');
            }
        }
        let hashedPassword = existingRepresentative.password;
        if (updateRepresentativeDto.password) {
            hashedPassword = await bcrypt.hash(updateRepresentativeDto.password, 10);
        }
        return this.prisma.representative.update({
            where: { id },
            data: {
                ...updateRepresentativeDto,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                cpfCnpj: true,
                email: true,
                phone: true,
                city: true,
                state: true,
                specializations: true,
                status: true,
                notes: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
                loginCount: true,
            },
        });
    }
    async remove(id) {
        const existingRepresentative = await this.prisma.representative.findUnique({
            where: { id },
        });
        if (!existingRepresentative) {
            throw new common_1.NotFoundException('Representante não encontrado');
        }
        const tokensCount = await this.prisma.representative_tokens.count({
            where: { representativeId: id },
        });
        if (tokensCount > 0) {
            throw new common_1.BadRequestException('Não é possível excluir o representante pois há tokens vinculados a ele.');
        }
        return this.prisma.representative.delete({
            where: { id },
        });
    }
    async updateLoginStats(id) {
        return this.prisma.representative.update({
            where: { id },
            data: {
                lastLoginAt: new Date(),
                loginCount: {
                    increment: 1,
                },
            },
        });
    }
    async getRepresentativeStats(representativeId) {
        const representative = await this.prisma.representative.findUnique({
            where: { id: representativeId },
            include: {
                Consumer: {
                    select: {
                        id: true,
                        status: true,
                        averageMonthlyConsumption: true,
                        allocatedPercentage: true,
                    },
                },
            },
        });
        if (!representative) {
            throw new common_1.NotFoundException('Representante não encontrado');
        }
        const totalConsumers = representative.Consumer.length;
        const totalKwh = representative.Consumer.reduce((sum, consumer) => sum + consumer.averageMonthlyConsumption, 0);
        let allocatedKwh = 0;
        let pendingKwh = 0;
        representative.Consumer.forEach(consumer => {
            if (consumer.status === 'ALLOCATED' && consumer.allocatedPercentage) {
                allocatedKwh += (consumer.averageMonthlyConsumption * consumer.allocatedPercentage) / 100;
            }
            else {
                pendingKwh += consumer.averageMonthlyConsumption;
            }
        });
        const consumersByStatus = {
            allocated: representative.Consumer.filter(c => c.status === 'ALLOCATED').length,
            inProcess: representative.Consumer.filter(c => c.status === 'IN_PROCESS').length,
            converted: representative.Consumer.filter(c => c.status === 'CONVERTED').length,
            available: representative.Consumer.filter(c => c.status === 'AVAILABLE').length,
        };
        return {
            representative: {
                id: representative.id,
                name: representative.name,
                email: representative.email,
                status: representative.status,
                specializations: representative.specializations,
            },
            stats: {
                totalConsumers,
                totalKwh: Math.round(totalKwh * 100) / 100,
                allocatedKwh: Math.round(allocatedKwh * 100) / 100,
                pendingKwh: Math.round(pendingKwh * 100) / 100,
                allocationRate: totalKwh > 0 ? Math.round((allocatedKwh / totalKwh) * 100 * 100) / 100 : 0,
                loginCount: representative.loginCount,
                lastLogin: representative.lastLoginAt,
            },
            consumersByStatus,
        };
    }
    async getStatistics() {
        const [totalRepresentatives, activeRepresentatives, representativesByStatus, representativesByState, topRepresentatives,] = await Promise.all([
            this.prisma.representative.count(),
            this.prisma.representative.count({
                where: { status: 'ACTIVE' },
            }),
            this.prisma.representative.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
            this.prisma.representative.groupBy({
                by: ['state'],
                _count: { state: true },
                orderBy: { _count: { state: 'desc' } },
                take: 10,
            }),
            this.prisma.representative.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    city: true,
                    state: true,
                    _count: {
                        select: {
                            Consumer: true,
                        },
                    },
                },
                orderBy: {
                    Consumer: {
                        _count: 'desc',
                    },
                },
                take: 10,
            }),
        ]);
        return {
            totalRepresentatives,
            activeRepresentatives,
            representativesByStatus: representativesByStatus.map(item => ({
                status: item.status,
                count: item._count.status,
            })),
            representativesByState: representativesByState.map(item => ({
                state: item.state,
                count: item._count.state,
            })),
            topRepresentatives: topRepresentatives.map(rep => ({
                id: rep.id,
                name: rep.name,
                email: rep.email,
                city: rep.city,
                state: rep.state,
                consumerCount: rep._count.Consumer,
            })),
            lastUpdated: new Date().toISOString(),
        };
    }
};
exports.RepresentativesService = RepresentativesService;
exports.RepresentativesService = RepresentativesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RepresentativesService);
//# sourceMappingURL=representatives.service.js.map