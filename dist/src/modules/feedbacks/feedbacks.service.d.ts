import { PrismaService } from '../../config/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RespondFeedbackDto } from './dto/respond-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';
export declare class FeedbacksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(representativeId: string, dto: CreateFeedbackDto): Promise<{
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
    findByRepresentative(representativeId: string): Promise<({
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
    findOneByRepresentative(feedbackId: string, representativeId: string): Promise<{
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
    respondAsRepresentative(feedbackId: string, representativeId: string, representativeName: string, dto: RespondFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        feedbackId: string;
        message: string;
        authorType: string;
        authorId: string;
        authorName: string;
    }>;
    countByRepresentative(representativeId: string): Promise<{
        total: number;
        open: number;
        inAnalysis: number;
        resolved: number;
        rejected: number;
    }>;
    findAll(filters?: {
        status?: string;
        type?: string;
        priority?: string;
        representativeId?: string;
    }): Promise<({
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
    findOne(feedbackId: string): Promise<{
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
    updateStatus(feedbackId: string, dto: UpdateFeedbackStatusDto, adminUserId: string): Promise<{
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
    respondAsAdmin(feedbackId: string, adminId: string, adminName: string, dto: RespondFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        feedbackId: string;
        message: string;
        authorType: string;
        authorId: string;
        authorName: string;
    }>;
    remove(feedbackId: string): Promise<{
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
}
