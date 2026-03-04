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
        concessionaire: string;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
        notes: string | null;
        createdByUserId: string | null;
        createdAt: Date;
    }>;
    getHistory(concessionaire: string): Promise<{
        id: string;
        concessionaire: string;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
        notes: string | null;
        createdByUserId: string | null;
        createdAt: Date;
    }[]>;
    getCurrentPrices(): Promise<{
        id: string;
        concessionaire: string;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
        notes: string | null;
        createdByUserId: string | null;
        createdAt: Date;
    }[]>;
    getCurrentPrice(concessionaire: string): Promise<{
        id: string;
        concessionaire: string;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
        notes: string | null;
        createdByUserId: string | null;
        createdAt: Date;
    }>;
    getPriceAtDate(concessionaire: string, date: string): Promise<{
        id: string;
        concessionaire: string;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
        notes: string | null;
        createdByUserId: string | null;
        createdAt: Date;
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
        concessionaire: string;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
        notes: string | null;
        createdByUserId: string | null;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        concessionaire: string;
        pricePerKwh: number;
        effectiveFrom: Date;
        effectiveUntil: Date | null;
        source: string | null;
        notes: string | null;
        createdByUserId: string | null;
        createdAt: Date;
    }>;
    getPriceComparison(): Promise<{
        concessionaire: string;
        currentPrice: number;
        effectiveSince: Date;
        source: string | null;
    }[]>;
}
