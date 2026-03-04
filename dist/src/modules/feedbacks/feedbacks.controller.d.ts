import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RespondFeedbackDto } from './dto/respond-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';
export declare class FeedbacksController {
    private readonly service;
    constructor(service: FeedbacksService);
    create(req: any, dto: CreateFeedbackDto): Promise<{
        representative: {
            id: string;
            name: string;
            email: string;
        };
        responses: {
            id: string;
            createdAt: Date;
            feedbackId: string;
            message: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
    } & {
        id: string;
        representativeId: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        subject: string;
        description: string;
        category: string | null;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findMyFeedbacks(req: any): Promise<({
        responses: {
            id: string;
            createdAt: Date;
            feedbackId: string;
            message: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
        _count: {
            responses: number;
        };
    } & {
        id: string;
        representativeId: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        subject: string;
        description: string;
        category: string | null;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    countMyFeedbacks(req: any): Promise<{
        total: number;
        open: number;
        inAnalysis: number;
        resolved: number;
        rejected: number;
    }>;
    findOneMy(id: string, req: any): Promise<{
        representative: {
            id: string;
            name: string;
            email: string;
        };
        responses: {
            id: string;
            createdAt: Date;
            feedbackId: string;
            message: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
    } & {
        id: string;
        representativeId: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        subject: string;
        description: string;
        category: string | null;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    respondAsRepresentative(id: string, req: any, dto: RespondFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        feedbackId: string;
        message: string;
        authorType: string;
        authorId: string;
        authorName: string;
    }>;
    findAll(status?: string, type?: string, priority?: string, representativeId?: string): Promise<({
        representative: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        responses: {
            id: string;
            createdAt: Date;
            feedbackId: string;
            message: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
        _count: {
            responses: number;
        };
    } & {
        id: string;
        representativeId: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        subject: string;
        description: string;
        category: string | null;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getMetrics(): Promise<{
        total: number;
        open: number;
        inAnalysis: number;
        resolved: number;
        rejected: number;
        byType: {
            type: import(".prisma/client").$Enums.FeedbackType;
            count: number;
        }[];
        byPriority: {
            priority: import(".prisma/client").$Enums.FeedbackPriority;
            count: number;
        }[];
        avgResolutionHours: number;
    }>;
    findOne(id: string): Promise<{
        representative: {
            id: string;
            name: string;
            email: string;
            phone: string;
            city: string;
            state: string;
        };
        responses: {
            id: string;
            createdAt: Date;
            feedbackId: string;
            message: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
    } & {
        id: string;
        representativeId: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        subject: string;
        description: string;
        category: string | null;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, req: any, dto: UpdateFeedbackStatusDto): Promise<{
        representative: {
            id: string;
            name: string;
            email: string;
        };
        responses: {
            id: string;
            createdAt: Date;
            feedbackId: string;
            message: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
    } & {
        id: string;
        representativeId: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        subject: string;
        description: string;
        category: string | null;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    respondAsAdmin(id: string, req: any, dto: RespondFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        feedbackId: string;
        message: string;
        authorType: string;
        authorId: string;
        authorName: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        representativeId: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        subject: string;
        description: string;
        category: string | null;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
