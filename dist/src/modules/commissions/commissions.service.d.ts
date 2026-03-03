import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { SettingsService } from '../settings/settings.service';
import { PaymentProofStorageService } from '../../common/services/payment-proof-storage.service';
export declare class CommissionsService {
    private prisma;
    private auditService;
    private settingsService;
    private paymentProofStorage;
    constructor(prisma: PrismaService, auditService: AuditService, settingsService: SettingsService, paymentProofStorage: PaymentProofStorageService);
    calculateCommission(kwhConsumption: number, kwhPrice: number): number;
    createCommissionForApprovedConsumer(consumerId: string): Promise<{
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
    }>;
    getRepresentativeCommissions(representativeId: string): Promise<{
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
    }[]>;
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
    })[]>;
    markCommissionAsPaid(commissionId: string, userId: string): Promise<{
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
    }>;
    getCommissionsByPeriod(representativeId: string, startDate: string, endDate: string): Promise<({
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
    }>;
    uploadPaymentProof(commissionId: string, file: Express.Multer.File, userId: string): Promise<{
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
    }>;
    downloadPaymentProof(commissionId: string): Promise<{
        buffer: Buffer<ArrayBufferLike>;
        fileName: string;
        mimeType: string;
    }>;
    deletePaymentProof(commissionId: string, userId: string): Promise<{
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
    }>;
}
