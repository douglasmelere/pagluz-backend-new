import { CommissionsService } from './commissions.service';
export declare class CommissionsController {
    private readonly commissionsService;
    constructor(commissionsService: CommissionsService);
    getMyCommissions(req: any): Promise<({
        consumer: {
            name: string;
            id: string;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            city: string;
            state: string;
            approvalStatus: import(".prisma/client").$Enums.ConsumerApprovalStatus;
            approvedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        representativeId: string;
        commissionValue: number;
        kwhConsumption: number;
        kwhPrice: number;
        notes: string | null;
        consumerId: string;
        calculatedAt: Date;
        paidAt: Date | null;
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
            name: string;
            id: string;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            city: string;
            state: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        representativeId: string;
        commissionValue: number;
        kwhConsumption: number;
        kwhPrice: number;
        notes: string | null;
        consumerId: string;
        calculatedAt: Date;
        paidAt: Date | null;
    })[]>;
    getCommissionDetails(commissionId: string): Promise<{
        representative: {
            email: string;
            name: string;
            id: string;
            phone: string;
        };
        consumer: {
            name: string;
            id: string;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            city: string;
            state: string;
            approvalStatus: import(".prisma/client").$Enums.ConsumerApprovalStatus;
            approvedAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        representativeId: string;
        commissionValue: number;
        kwhConsumption: number;
        kwhPrice: number;
        notes: string | null;
        consumerId: string;
        calculatedAt: Date;
        paidAt: Date | null;
    }>;
    getAllCommissions(): Promise<({
        representative: {
            email: string;
            name: string;
            id: string;
        };
        consumer: {
            name: string;
            id: string;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            city: string;
            state: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        representativeId: string;
        commissionValue: number;
        kwhConsumption: number;
        kwhPrice: number;
        notes: string | null;
        consumerId: string;
        calculatedAt: Date;
        paidAt: Date | null;
    })[]>;
    getPendingCommissions(): Promise<({
        representative: {
            email: string;
            name: string;
            id: string;
        };
        consumer: {
            name: string;
            id: string;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            city: string;
            state: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        representativeId: string;
        commissionValue: number;
        kwhConsumption: number;
        kwhPrice: number;
        notes: string | null;
        consumerId: string;
        calculatedAt: Date;
        paidAt: Date | null;
    })[]>;
    markCommissionAsPaid(commissionId: string, req: any): Promise<{
        representative: {
            email: string;
            name: string;
            id: string;
        };
        consumer: {
            name: string;
            id: string;
            cpfCnpj: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.CommissionStatus;
        representativeId: string;
        commissionValue: number;
        kwhConsumption: number;
        kwhPrice: number;
        notes: string | null;
        consumerId: string;
        calculatedAt: Date;
        paidAt: Date | null;
    }>;
    getAdminCommissionStats(): Promise<{
        message: string;
        totalCommissions: number;
        totalValue: number;
        pendingCommissions: number;
        paidCommissions: number;
    }>;
}
