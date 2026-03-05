import { KwhPriceService } from './kwh-price.service';
export declare class KwhPriceController {
    private readonly service;
    constructor(service: KwhPriceService);
    create(body: any, req: any): Promise<{
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
    getConcessionaires(): Promise<string[]>;
    getComparison(): Promise<{
        concessionaire: string;
        currentPrice: number;
        effectiveSince: Date;
        source: string | null;
    }[]>;
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
    update(id: string, body: any): Promise<{
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
}
