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
exports.KwhPriceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let KwhPriceService = class KwhPriceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const current = await this.prisma.kwhPriceHistory.findFirst({
            where: {
                concessionaire: data.concessionaire,
                effectiveUntil: null,
            },
        });
        if (current) {
            const newStart = new Date(data.effectiveFrom);
            if (newStart <= current.effectiveFrom) {
                throw new common_1.BadRequestException('A data de início deve ser posterior ao preço vigente.');
            }
            await this.prisma.kwhPriceHistory.update({
                where: { id: current.id },
                data: {
                    effectiveUntil: new Date(new Date(data.effectiveFrom).getTime() - 86400000),
                },
            });
        }
        return this.prisma.kwhPriceHistory.create({
            data: {
                concessionaire: data.concessionaire,
                pricePerKwh: data.pricePerKwh,
                effectiveFrom: new Date(data.effectiveFrom),
                effectiveUntil: data.effectiveUntil ? new Date(data.effectiveUntil) : null,
                source: data.source ?? null,
                notes: data.notes ?? null,
                createdByUserId: data.createdByUserId ?? null,
            },
        });
    }
    async getHistory(concessionaire) {
        return this.prisma.kwhPriceHistory.findMany({
            where: { concessionaire },
            orderBy: { effectiveFrom: 'desc' },
        });
    }
    async getCurrentPrices() {
        const prices = await this.prisma.kwhPriceHistory.findMany({
            where: { effectiveUntil: null },
            orderBy: { concessionaire: 'asc' },
        });
        return prices;
    }
    async getCurrentPrice(concessionaire) {
        const price = await this.prisma.kwhPriceHistory.findFirst({
            where: {
                concessionaire,
                effectiveUntil: null,
            },
        });
        if (!price) {
            throw new common_1.NotFoundException(`Preço não encontrado para a concessionária: ${concessionaire}`);
        }
        return price;
    }
    async getPriceAtDate(concessionaire, date) {
        const targetDate = new Date(date);
        const price = await this.prisma.kwhPriceHistory.findFirst({
            where: {
                concessionaire,
                effectiveFrom: { lte: targetDate },
                OR: [
                    { effectiveUntil: null },
                    { effectiveUntil: { gte: targetDate } },
                ],
            },
            orderBy: { effectiveFrom: 'desc' },
        });
        if (!price) {
            throw new common_1.NotFoundException(`Preço não encontrado para ${concessionaire} na data ${date}`);
        }
        return price;
    }
    async getConcessionaires() {
        const result = await this.prisma.kwhPriceHistory.findMany({
            select: { concessionaire: true },
            distinct: ['concessionaire'],
            orderBy: { concessionaire: 'asc' },
        });
        return result.map(r => r.concessionaire);
    }
    async update(id, data) {
        const existing = await this.prisma.kwhPriceHistory.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Registro não encontrado');
        return this.prisma.kwhPriceHistory.update({
            where: { id },
            data: {
                pricePerKwh: data.pricePerKwh ?? existing.pricePerKwh,
                effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : existing.effectiveFrom,
                effectiveUntil: data.effectiveUntil ? new Date(data.effectiveUntil) : existing.effectiveUntil,
                source: data.source ?? existing.source,
                notes: data.notes ?? existing.notes,
            },
        });
    }
    async remove(id) {
        const existing = await this.prisma.kwhPriceHistory.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Registro não encontrado');
        return this.prisma.kwhPriceHistory.delete({ where: { id } });
    }
    async getPriceComparison() {
        const currentPrices = await this.getCurrentPrices();
        return currentPrices.map(p => ({
            concessionaire: p.concessionaire,
            currentPrice: p.pricePerKwh,
            effectiveSince: p.effectiveFrom,
            source: p.source,
        })).sort((a, b) => a.currentPrice - b.currentPrice);
    }
};
exports.KwhPriceService = KwhPriceService;
exports.KwhPriceService = KwhPriceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KwhPriceService);
//# sourceMappingURL=kwh-price.service.js.map