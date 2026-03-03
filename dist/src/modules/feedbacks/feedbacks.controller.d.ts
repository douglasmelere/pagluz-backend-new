import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RespondFeedbackDto } from './dto/respond-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';
export declare class FeedbacksController {
    private readonly service;
    constructor(service: FeedbacksService);
    create(req: any, dto: CreateFeedbackDto): Promise<{
        representative: {
            email: string;
            name: string;
            id: string;
        };
        responses: {
            id: string;
            createdAt: Date;
            message: string;
            feedbackId: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
    } & {
        description: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        representativeId: string;
        subject: string;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        category: string | null;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    }>;
    findMyFeedbacks(req: any): Promise<({
        _count: {
            responses: number;
        };
        responses: {
            id: string;
            createdAt: Date;
            message: string;
            feedbackId: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
    } & {
        description: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        representativeId: string;
        subject: string;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        category: string | null;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
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
            email: string;
            name: string;
            id: string;
        };
        responses: {
            id: string;
            createdAt: Date;
            message: string;
            feedbackId: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
    } & {
        description: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        representativeId: string;
        subject: string;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        category: string | null;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    }>;
    respondAsRepresentative(id: string, req: any, dto: RespondFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        feedbackId: string;
        authorType: string;
        authorId: string;
        authorName: string;
    }>;
    findAll(status?: string, type?: string, priority?: string, representativeId?: string): Promise<({
        representative: {
            email: string;
            name: string;
            id: string;
            phone: string;
        };
        _count: {
            responses: number;
        };
        responses: {
            id: string;
            createdAt: Date;
            message: string;
            feedbackId: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
    } & {
        description: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        representativeId: string;
        subject: string;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        category: string | null;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
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
            email: string;
            name: string;
            id: string;
            phone: string;
            city: string;
            state: string;
        };
        responses: {
            id: string;
            createdAt: Date;
            message: string;
            feedbackId: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
    } & {
        description: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        representativeId: string;
        subject: string;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        category: string | null;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    }>;
    updateStatus(id: string, req: any, dto: UpdateFeedbackStatusDto): Promise<{
        representative: {
            email: string;
            name: string;
            id: string;
        };
        responses: {
            id: string;
            createdAt: Date;
            message: string;
            feedbackId: string;
            authorType: string;
            authorId: string;
            authorName: string;
        }[];
    } & {
        description: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        representativeId: string;
        subject: string;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        category: string | null;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    }>;
    respondAsAdmin(id: string, req: any, dto: RespondFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        feedbackId: string;
        authorType: string;
        authorId: string;
        authorName: string;
    }>;
    remove(id: string): Promise<{
        description: string;
        type: import(".prisma/client").$Enums.FeedbackType;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.FeedbackStatus;
        representativeId: string;
        subject: string;
        priority: import(".prisma/client").$Enums.FeedbackPriority;
        category: string | null;
        attachmentUrl: string | null;
        attachmentFileName: string | null;
        resolvedAt: Date | null;
        resolvedByUserId: string | null;
    }>;
}
