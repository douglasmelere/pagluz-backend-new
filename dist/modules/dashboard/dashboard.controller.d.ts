import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(): Promise<{
        summary: {
            totalGenerators: number;
            totalConsumers: number;
            totalInstalledPower: number;
            newClientsThisWeek: number;
            newGeneratorsThisWeek: number;
            newConsumersThisWeek: number;
        };
        stateDistribution: any[];
        recentActivity: ({
            id: string;
            type: "generator";
            name: string;
            subtype: import(".prisma/client").$Enums.SourceType;
            createdAt: Date;
        } | {
            id: string;
            type: "consumer";
            name: string;
            subtype: import(".prisma/client").$Enums.ConsumerType;
            createdAt: Date;
        })[];
        insights: {
            totalMonthlyConsumption: number;
            allocationRate: number;
            estimatedMonthlySavings: number;
            totalAllocatedEnergy: number;
            capacityUtilization: {
                totalCapacity: number;
                allocatedCapacity: number;
                availableCapacity: number;
                utilizationRate: number;
            };
            generatorStatus: {
                underAnalysis: number;
                awaitingAllocation: number;
            };
        };
    }>;
    getGeneratorsBySourceType(): Promise<{
        sourceType: import(".prisma/client").$Enums.SourceType;
        count: number;
        totalPower: number;
    }[]>;
    getConsumersByType(): Promise<{
        consumerType: import(".prisma/client").$Enums.ConsumerType;
        count: number;
        totalConsumption: number;
    }[]>;
}
