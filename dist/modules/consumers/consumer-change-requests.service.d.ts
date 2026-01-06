import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';
export declare class ConsumerChangeRequestsService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    createChangeRequest(consumerId: string, representativeId: string, newValues: any, userId?: string): Promise<{
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
        status: import(".prisma/client").$Enums.ChangeRequestStatus;
        representativeId: string;
        oldValues: import("@prisma/client/runtime/library").JsonValue | null;
        newValues: import("@prisma/client/runtime/library").JsonValue;
        rejectionReason: string | null;
        consumerId: string;
        changedFields: string[];
        requestedAt: Date;
        reviewedByUserId: string | null;
        reviewedAt: Date | null;
    }>;
    approveChangeRequest(changeRequestId: string, adminUserId: string, rejectionReason?: string): Promise<{
        changeRequest: {
            consumer: {
                number: string | null;
                email: string | null;
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                documentType: import(".prisma/client").$Enums.DocumentType | null;
                cpfCnpj: string;
                representativeName: string | null;
                representativeRg: string | null;
                phone: string | null;
                concessionaire: string;
                ucNumber: string;
                consumerType: import(".prisma/client").$Enums.ConsumerType;
                phase: import(".prisma/client").$Enums.PhaseType;
                averageMonthlyConsumption: number;
                discountOffered: number;
                receiveWhatsapp: boolean;
                street: string | null;
                complement: string | null;
                neighborhood: string | null;
                city: string;
                state: string;
                zipCode: string | null;
                birthDate: Date | null;
                observations: string | null;
                arrivalDate: Date | null;
                status: import(".prisma/client").$Enums.ConsumerStatus;
                allocatedPercentage: number | null;
                generatorId: string | null;
                representativeId: string | null;
                approvalStatus: import(".prisma/client").$Enums.ConsumerApprovalStatus;
                submittedByRepresentativeId: string | null;
                approvedByUserId: string | null;
                approvedAt: Date | null;
                rejectionReason: string | null;
                invoiceUrl: string | null;
                invoiceFileName: string | null;
                invoiceUploadedAt: Date | null;
                invoiceScannedData: import("@prisma/client/runtime/library").JsonValue | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ChangeRequestStatus;
            representativeId: string;
            oldValues: import("@prisma/client/runtime/library").JsonValue | null;
            newValues: import("@prisma/client/runtime/library").JsonValue;
            rejectionReason: string | null;
            consumerId: string;
            changedFields: string[];
            requestedAt: Date;
            reviewedByUserId: string | null;
            reviewedAt: Date | null;
        };
        consumer: {
            number: string | null;
            email: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            documentType: import(".prisma/client").$Enums.DocumentType | null;
            cpfCnpj: string;
            representativeName: string | null;
            representativeRg: string | null;
            phone: string | null;
            concessionaire: string;
            ucNumber: string;
            consumerType: import(".prisma/client").$Enums.ConsumerType;
            phase: import(".prisma/client").$Enums.PhaseType;
            averageMonthlyConsumption: number;
            discountOffered: number;
            receiveWhatsapp: boolean;
            street: string | null;
            complement: string | null;
            neighborhood: string | null;
            city: string;
            state: string;
            zipCode: string | null;
            birthDate: Date | null;
            observations: string | null;
            arrivalDate: Date | null;
            status: import(".prisma/client").$Enums.ConsumerStatus;
            allocatedPercentage: number | null;
            generatorId: string | null;
            representativeId: string | null;
            approvalStatus: import(".prisma/client").$Enums.ConsumerApprovalStatus;
            submittedByRepresentativeId: string | null;
            approvedByUserId: string | null;
            approvedAt: Date | null;
            rejectionReason: string | null;
            invoiceUrl: string | null;
            invoiceFileName: string | null;
            invoiceUploadedAt: Date | null;
            invoiceScannedData: import("@prisma/client/runtime/library").JsonValue | null;
        };
    }>;
    rejectChangeRequest(changeRequestId: string, adminUserId: string, rejectionReason: string): Promise<{
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
        status: import(".prisma/client").$Enums.ChangeRequestStatus;
        representativeId: string;
        oldValues: import("@prisma/client/runtime/library").JsonValue | null;
        newValues: import("@prisma/client/runtime/library").JsonValue;
        rejectionReason: string | null;
        consumerId: string;
        changedFields: string[];
        requestedAt: Date;
        reviewedByUserId: string | null;
        reviewedAt: Date | null;
    }>;
    getPendingRequests(page?: number, limit?: number): Promise<{
        data: ({
            representative: {
                email: string;
                name: string;
                id: string;
            };
            consumer: {
                name: string;
                id: string;
                cpfCnpj: string;
                ucNumber: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.ChangeRequestStatus;
            representativeId: string;
            oldValues: import("@prisma/client/runtime/library").JsonValue | null;
            newValues: import("@prisma/client/runtime/library").JsonValue;
            rejectionReason: string | null;
            consumerId: string;
            changedFields: string[];
            requestedAt: Date;
            reviewedByUserId: string | null;
            reviewedAt: Date | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getRepresentativeRequests(representativeId: string): Promise<({
        consumer: {
            name: string;
            id: string;
            cpfCnpj: string;
        };
        reviewedBy: {
            email: string;
            name: string | null;
            id: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ChangeRequestStatus;
        representativeId: string;
        oldValues: import("@prisma/client/runtime/library").JsonValue | null;
        newValues: import("@prisma/client/runtime/library").JsonValue;
        rejectionReason: string | null;
        consumerId: string;
        changedFields: string[];
        requestedAt: Date;
        reviewedByUserId: string | null;
        reviewedAt: Date | null;
    })[]>;
    private extractOldValues;
}
