import { PrismaService } from '../../config/prisma.service';
export declare class KwhPriceService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        concessionaire: string;
        pricePerKwh: number;
        effectiveFrom: string;
        effectiveUntil?: string;
        source?: string;
        notes?: string;
        createdByUserId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        concessionaire: string;
        notes: string | null;
        createdByUserId: string | null;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
    }>;
    getHistory(concessionaire: string): Promise<{
        id: string;
        createdAt: Date;
        concessionaire: string;
        notes: string | null;
        createdByUserId: string | null;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
    }[]>;
    getCurrentPrices(): Promise<{
        id: string;
        createdAt: Date;
        concessionaire: string;
        notes: string | null;
        createdByUserId: string | null;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
    }[]>;
    getCurrentPrice(concessionaire: string): Promise<{
        id: string;
        createdAt: Date;
        concessionaire: string;
        notes: string | null;
        createdByUserId: string | null;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
    }>;
    getPriceAtDate(concessionaire: string, date: string): Promise<{
        id: string;
        createdAt: Date;
        concessionaire: string;
        notes: string | null;
        createdByUserId: string | null;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
    }>;
    getConcessionaires(): Promise<string[]>;
    update(id: string, data: {
        pricePerKwh?: number;
        effectiveFrom?: string;
        effectiveUntil?: string;
        source?: string;
        notes?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        concessionaire: string;
        notes: string | null;
        createdByUserId: string | null;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        concessionaire: string;
        notes: string | null;
        createdByUserId: string | null;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
    }>;
    getPriceComparison(): Promise<{
        concessionaire: string;
        currentPrice: number;
        effectiveSince: Date;
        source: string | null;
    }[]>;
}
