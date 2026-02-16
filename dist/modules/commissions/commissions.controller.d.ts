import { CommissionsService } from './commissions.service';
export declare class CommissionsController {
    private readonly commissionsService;
    constructor(commissionsService: CommissionsService);
    getMyCommissions(req: any): Promise<({
        consumer: {
            id: string;
            name: string;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            city: string;
            state: string;
            approvalStatus: import(".prisma/client").$Enums.ConsumerApprovalStatus;
            approvedAt: Date | null;
        };
    } & {
        id: string;
        representativeId: string;
        consumerId: string;
        kwhConsumption: number;
        kwhPrice: number;
        commissionValue: number;
        status: import(".prisma/client").$Enums.CommissionStatus;
        calculatedAt: Date;
        paidAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getMyCommissionStats(req: any): Promise<{
        totalCommissions: number;
        paidCommissions: number;
        pendingCommissions: number;
        totalConsumers: number;
        statusBreakdown: {};
        monthlyCommissions: {
            month: string;
            count: number;
            value: number;
        }[];
    }>;
    getCommissionsByPeriod(req: any, startDate: string, endDate: string): Promise<({
        consumer: {
            id: string;
            name: string;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            city: string;
            state: string;
        };
    } & {
        id: string;
        representativeId: string;
        consumerId: string;
        kwhConsumption: number;
        kwhPrice: number;
        commissionValue: number;
        status: import(".prisma/client").$Enums.CommissionStatus;
        calculatedAt: Date;
        paidAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getCommissionDetails(commissionId: string): Promise<{
        representative: {
            id: string;
            name: string;
            phone: string;
            email: string;
        };
        consumer: {
            id: string;
            name: string;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            city: string;
            state: string;
            approvalStatus: import(".prisma/client").$Enums.ConsumerApprovalStatus;
            approvedAt: Date | null;
        };
    } & {
        id: string;
        representativeId: string;
        consumerId: string;
        kwhConsumption: number;
        kwhPrice: number;
        commissionValue: number;
        status: import(".prisma/client").$Enums.CommissionStatus;
        calculatedAt: Date;
        paidAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAllCommissions(): Promise<({
        representative: {
            id: string;
            name: string;
            email: string;
        };
        consumer: {
            id: string;
            name: string;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            city: string;
            state: string;
        };
    } & {
        id: string;
        representativeId: string;
        consumerId: string;
        kwhConsumption: number;
        kwhPrice: number;
        commissionValue: number;
        status: import(".prisma/client").$Enums.CommissionStatus;
        calculatedAt: Date;
        paidAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getPendingCommissions(): Promise<({
        representative: {
            id: string;
            name: string;
            email: string;
        };
        consumer: {
            id: string;
            name: string;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            city: string;
            state: string;
        };
    } & {
        id: string;
        representativeId: string;
        consumerId: string;
        kwhConsumption: number;
        kwhPrice: number;
        commissionValue: number;
        status: import(".prisma/client").$Enums.CommissionStatus;
        calculatedAt: Date;
        paidAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    markCommissionAsPaid(commissionId: string, req: any): Promise<{
        representative: {
            id: string;
            name: string;
            email: string;
        };
        consumer: {
            id: string;
            name: string;
            cpfCnpj: string;
        };
    } & {
        id: string;
        representativeId: string;
        consumerId: string;
        kwhConsumption: number;
        kwhPrice: number;
        commissionValue: number;
        status: import(".prisma/client").$Enums.CommissionStatus;
        calculatedAt: Date;
        paidAt: Date | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getAdminCommissionStats(): Promise<{
        message: string;
        totalCommissions: number;
        totalValue: number;
        pendingCommissions: number;
        paidCommissions: number;
    }>;
}
