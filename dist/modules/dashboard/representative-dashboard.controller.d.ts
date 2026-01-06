import { RepresentativeDashboardService } from './representative-dashboard.service';
export declare class RepresentativeDashboardController {
    private readonly representativeDashboardService;
    constructor(representativeDashboardService: RepresentativeDashboardService);
    getDashboard(req: any): Promise<{
        representative: {
            id: string;
            name: string;
            email: string;
            status: import(".prisma/client").$Enums.RepresentativeStatus;
            specializations: string[];
            phone: string;
            city: string;
            state: string;
        };
        stats: {
            totalConsumers: number;
            totalKwh: number;
            allocatedKwh: number;
            pendingKwh: number;
            allocationRate: number;
            estimatedMonthlySavings: number;
        };
        consumersByStatus: {
            allocated: {
                count: number;
                totalKwh: number;
                consumers: any[];
            };
            inProcess: {
                count: number;
                totalKwh: number;
                consumers: any[];
            };
            converted: {
                count: number;
                totalKwh: number;
                consumers: any[];
            };
            available: {
                count: number;
                totalKwh: number;
                consumers: any[];
            };
        };
        geographicDistribution: any[];
        monthlyEvolution: any[];
        recentActivity: {
            generator: {
                id: string;
                status: import(".prisma/client").$Enums.GeneratorStatus;
                ownerName: string;
                sourceType: import(".prisma/client").$Enums.SourceType;
                installedPower: number;
            } | null;
            name: string;
            id: string;
            createdAt: Date;
            cpfCnpj: string;
            concessionaire: string;
            ucNumber: string;
            consumerType: import(".prisma/client").$Enums.ConsumerType;
            averageMonthlyConsumption: number;
            discountOffered: number;
            city: string;
            state: string;
            status: import(".prisma/client").$Enums.ConsumerStatus;
            allocatedPercentage: number | null;
        }[];
    }>;
    getCommercialMaterials(): Promise<{
        materials: {
            id: string;
            title: string;
            description: string;
            type: string;
            url: string;
            updatedAt: Date;
        }[];
    }>;
}
