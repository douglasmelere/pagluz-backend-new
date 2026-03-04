import { PrismaService } from '../../config/prisma.service';
export declare class AdvancedDashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getConsumerGrowth(months?: number, representativeId?: string): Promise<any[]>;
    getCommissionGrowth(months?: number, representativeId?: string): Promise<any[]>;
    getKwhEvolution(months?: number, representativeId?: string): Promise<any[]>;
    getConcessionaireDistribution(representativeId?: string): Promise<{
        concessionaire: string;
        count: number;
        totalKwh: number;
    }[]>;
    getConsumerTypeDistribution(representativeId?: string): Promise<{
        type: import(".prisma/client").$Enums.ConsumerType;
        label: string;
        count: number;
        totalKwh: number;
    }[]>;
    getGeographicDistribution(representativeId?: string): Promise<{
        state: string;
        city: string;
        count: number;
    }[]>;
    getFullDashboard(months?: number, representativeId?: string): Promise<{
        consumerGrowth: any[];
        commissionGrowth: any[];
        kwhEvolution: any[];
        concessionaireDistribution: {
            concessionaire: string;
            count: number;
            totalKwh: number;
        }[];
        consumerTypeDistribution: {
            type: import(".prisma/client").$Enums.ConsumerType;
            label: string;
            count: number;
            totalKwh: number;
        }[];
        geographicDistribution: {
            state: string;
            city: string;
            count: number;
        }[];
    }>;
}
