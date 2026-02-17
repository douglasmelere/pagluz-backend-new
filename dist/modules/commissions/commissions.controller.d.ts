import { Response } from 'express';
import { CommissionsService } from './commissions.service';
export declare class CommissionsController {
    private readonly commissionsService;
    constructor(commissionsService: CommissionsService);
    getMyCommissions(req: any): Promise<{
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
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
    }[]>;
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    downloadPaymentProofAsRepresentative(commissionId: string, res: Response): Promise<void>;
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadPaymentProof(commissionId: string, file: Express.Multer.File, req: any): Promise<{
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    downloadPaymentProof(commissionId: string, res: Response): Promise<void>;
    deletePaymentProof(commissionId: string, req: any): Promise<{
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
        paymentProofUrl: string | null;
        paymentProofFileName: string | null;
        paymentProofUploadedAt: Date | null;
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
