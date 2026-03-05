import { PrismaService } from '../../config/prisma.service';
import { CreateProposalRequestDto } from './dto/create-proposal-request.dto';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { WebhookService } from '../../common/services/webhook.service';
import { PushNotificationService } from '../push-notifications/push-notification.service';
export declare class ProposalRequestsService {
    private prisma;
    private notificationsService;
    private configService;
    private webhookService;
    private pushNotificationService;
    private supabase;
    private readonly BUCKET_NAME;
    constructor(prisma: PrismaService, notificationsService: AdminNotificationsService, configService: ConfigService, webhookService: WebhookService, pushNotificationService: PushNotificationService);
    create(representativeId: string, dto: CreateProposalRequestDto): Promise<{
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
    findByRepresentative(representativeId: string): Promise<{
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
    markAsGenerated(id: string, file?: Express.Multer.File): Promise<{
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
    downloadDocument(id: string, res: Response, representativeId?: string): Promise<void>;
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
