import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';
export declare class SettingsService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    getCurrentKwhPrice(): Promise<number>;
    setKwhPrice(price: number, userId: string): Promise<any>;
    getKwhPriceHistory(): Promise<{
        id: string;
        value: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAllSettings(): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    setSetting(key: string, value: string, description: string, userId: string): Promise<{
        id: any;
        key: any;
        value: any;
        description: any;
        updatedAt: any;
    }>;
    getSystemStats(): Promise<{
        totalConsumers: number;
        totalRepresentatives: number;
        totalCommissions: number;
        totalCommissionsValue: number;
        currentKwhPrice: number;
        lastUpdated: Date;
    }>;
}
