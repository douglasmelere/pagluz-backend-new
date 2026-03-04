import { KwhPriceService } from './kwh-price.service';
export declare class KwhPriceController {
    private readonly service;
    constructor(service: KwhPriceService);
    create(body: any, req: any): Promise<{
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
    getConcessionaires(): Promise<string[]>;
    getComparison(): Promise<{
        concessionaire: string;
        currentPrice: number;
        effectiveSince: Date;
        source: string | null;
    }[]>;
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
    update(id: string, body: any): Promise<{
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
}
