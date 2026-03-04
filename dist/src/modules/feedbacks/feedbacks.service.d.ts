import { PrismaService } from '../../config/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RespondFeedbackDto } from './dto/respond-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';
export declare class FeedbacksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(representativeId: string, dto: CreateFeedbackDto): Promise<{
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
    findByRepresentative(representativeId: string): Promise<({
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
    findOneByRepresentative(feedbackId: string, representativeId: string): Promise<{
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
    respondAsRepresentative(feedbackId: string, representativeId: string, representativeName: string, dto: RespondFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        feedbackId: string;
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
    findOne(feedbackId: string): Promise<{
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
    updateStatus(feedbackId: string, dto: UpdateFeedbackStatusDto, adminUserId: string): Promise<{
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
    respondAsAdmin(feedbackId: string, adminId: string, adminName: string, dto: RespondFeedbackDto): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        feedbackId: string;
        authorType: string;
        authorId: string;
        authorName: string;
    }>;
    remove(feedbackId: string): Promise<{
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
