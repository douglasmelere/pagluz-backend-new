import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class KwhPriceService {
  constructor(private prisma: PrismaService) { }

  // ─── Criar registro de preço ────────────────────────────────────────────────

  async create(data: {
    concessionaire: string;
    pricePerKwh: number;
    effectiveFrom: string;
    effectiveUntil?: string;
    source?: string;
    notes?: string;
    createdByUserId?: string;
  }) {
    if (data.concessionaire) {
      data.concessionaire = data.concessionaire.toUpperCase().trim();
    }

    // Fecha o preço anterior (se existir) para a mesma concessionária
    const current = await this.prisma.kwhPriceHistory.findFirst({
      where: {
        concessionaire: data.concessionaire,
        effectiveUntil: null,
      },
    });

    if (current) {
      const newStart = new Date(data.effectiveFrom);
      if (newStart <= current.effectiveFrom) {
        throw new BadRequestException('A data de início deve ser posterior ao preço vigente.');
      }

      // Fecha o período anterior
      await this.prisma.kwhPriceHistory.update({
        where: { id: current.id },
        data: {
          effectiveUntil: new Date(new Date(data.effectiveFrom).getTime() - 86400000), // dia anterior
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

  // ─── Listar histórico de uma concessionária ─────────────────────────────────

  async getHistory(concessionaire: string) {
    return this.prisma.kwhPriceHistory.findMany({
      where: { concessionaire },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  // ─── Listar todas as concessionárias com preço vigente ──────────────────────

  async getCurrentPrices() {
    const prices = await this.prisma.kwhPriceHistory.findMany({
      where: { effectiveUntil: null },
      orderBy: { concessionaire: 'asc' },
    });

    return prices;
  }

  // ─── Obter preço vigente por concessionária ─────────────────────────────────

  async getCurrentPrice(concessionaire: string) {
    const price = await this.prisma.kwhPriceHistory.findFirst({
      where: {
        concessionaire,
        effectiveUntil: null,
      },
    });

    if (!price) {
      throw new NotFoundException(`Preço não encontrado para a concessionária: ${concessionaire}`);
    }

    return price;
  }

  // ─── Obter preço em uma data específica ─────────────────────────────────────

  async getPriceAtDate(concessionaire: string, date: string) {
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
      throw new NotFoundException(`Preço não encontrado para ${concessionaire} na data ${date}`);
    }

    return price;
  }

  // ─── Listar todas as concessionárias ────────────────────────────────────────

  async getConcessionaires() {
    const result = await this.prisma.kwhPriceHistory.findMany({
      select: { concessionaire: true },
      distinct: ['concessionaire'],
      orderBy: { concessionaire: 'asc' },
    });

    return result.map(r => r.concessionaire);
  }

  // ─── Atualizar registro ─────────────────────────────────────────────────────

  async update(id: string, data: {
    pricePerKwh?: number;
    effectiveFrom?: string;
    effectiveUntil?: string;
    source?: string;
    notes?: string;
  }) {
    const existing = await this.prisma.kwhPriceHistory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Registro não encontrado');

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

  // ─── Excluir registro ──────────────────────────────────────────────────────

  async remove(id: string) {
    const existing = await this.prisma.kwhPriceHistory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Registro não encontrado');
    return this.prisma.kwhPriceHistory.delete({ where: { id } });
  }

  // ─── Comparativo de preços ──────────────────────────────────────────────────

  async getPriceComparison() {
    const currentPrices = await this.getCurrentPrices();

    return currentPrices.map(p => ({
      concessionaire: p.concessionaire,
      currentPrice: p.pricePerKwh,
      effectiveSince: p.effectiveFrom,
      source: p.source,
    })).sort((a, b) => a.currentPrice - b.currentPrice);
  }
}
