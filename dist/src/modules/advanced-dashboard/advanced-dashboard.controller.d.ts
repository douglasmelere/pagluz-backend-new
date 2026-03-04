import { AdvancedDashboardService } from './advanced-dashboard.service';
export declare class AdvancedDashboardController {
    private readonly service;
    constructor(service: AdvancedDashboardService);
    getRepDashboard(req: any, months?: string): Promise<{
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
    getRepConsumerGrowth(req: any, months?: string): Promise<any[]>;
    getRepCommissionGrowth(req: any, months?: string): Promise<any[]>;
    getAdminDashboard(months?: string, representativeId?: string): Promise<{
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
    getConsumerGrowth(months?: string, representativeId?: string): Promise<any[]>;
    getCommissionGrowth(months?: string, representativeId?: string): Promise<any[]>;
    getKwhEvolution(months?: string, representativeId?: string): Promise<any[]>;
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
}
