import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { SettingsService } from '../settings/settings.service';
export declare class CommissionsService {
    private prisma;
    private auditService;
    private settingsService;
    constructor(prisma: PrismaService, auditService: AuditService, settingsService: SettingsService);
    calculateCommission(kwhConsumption: number, kwhPrice: number): number;
    createCommissionForApprovedConsumer(consumerId: string): Promise<{
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
    getRepresentativeCommissions(representativeId: string): Promise<({
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
    getRepresentativeCommissionStats(representativeId: string): Promise<{
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
    markCommissionAsPaid(commissionId: string, userId: string): Promise<{
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
    getCommissionsByPeriod(representativeId: string, startDate: string, endDate: string): Promise<({
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
}
