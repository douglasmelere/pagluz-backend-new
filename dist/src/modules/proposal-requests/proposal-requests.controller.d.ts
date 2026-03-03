import { Response } from 'express';
import { ProposalRequestsService } from './proposal-requests.service';
import { CreateProposalRequestDto } from './dto/create-proposal-request.dto';
export declare class ProposalRequestsController {
    private readonly proposalRequestsService;
    constructor(proposalRequestsService: ProposalRequestsService);
    create(req: any, dto: CreateProposalRequestDto): Promise<{
        representative: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ProposalRequestStatus;
        representativeId: string;
        documentUrl: string | null;
        clientName: string;
        invoiceAmount: number;
        phaseType: import(".prisma/client").$Enums.PhaseType;
        kwhValue: number;
        documentFileName: string | null;
        documentUploadedAt: Date | null;
    }>;
    findMyRequests(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ProposalRequestStatus;
        representativeId: string;
        documentUrl: string | null;
        clientName: string;
        invoiceAmount: number;
        phaseType: import(".prisma/client").$Enums.PhaseType;
        kwhValue: number;
        documentFileName: string | null;
        documentUploadedAt: Date | null;
    }[]>;
    downloadMyDocument(req: any, id: string, res: Response): Promise<void>;
    findAll(): Promise<({
        representative: {
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ProposalRequestStatus;
        representativeId: string;
        documentUrl: string | null;
        clientName: string;
        invoiceAmount: number;
        phaseType: import(".prisma/client").$Enums.PhaseType;
        kwhValue: number;
        documentFileName: string | null;
        documentUploadedAt: Date | null;
    })[]>;
    markAsGenerated(id: string, file: Express.Multer.File): Promise<{
        representative: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ProposalRequestStatus;
        representativeId: string;
        documentUrl: string | null;
        clientName: string;
        invoiceAmount: number;
        phaseType: import(".prisma/client").$Enums.PhaseType;
        kwhValue: number;
        documentFileName: string | null;
        documentUploadedAt: Date | null;
    }>;
    downloadDocumentAdmin(id: string, res: Response): Promise<void>;
    delete(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ProposalRequestStatus;
        representativeId: string;
        documentUrl: string | null;
        clientName: string;
        invoiceAmount: number;
        phaseType: import(".prisma/client").$Enums.PhaseType;
        kwhValue: number;
        documentFileName: string | null;
        documentUploadedAt: Date | null;
    }>;
}
