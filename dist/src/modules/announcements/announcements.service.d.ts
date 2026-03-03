import { PrismaService } from '../../config/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
export declare class AnnouncementsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAnnouncementDto): Promise<{
        representative: {
            email: string;
            name: string;
            id: string;
        } | null;
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        representativeId: string | null;
        message: string;
        priority: import(".prisma/client").$Enums.AnnouncementPriority;
    }>;
    findAll(): Promise<({
        representative: {
            email: string;
            name: string;
            id: string;
        } | null;
        reads: {
            representativeId: string;
            readAt: Date;
        }[];
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        representativeId: string | null;
        message: string;
        priority: import(".prisma/client").$Enums.AnnouncementPriority;
    })[]>;
    findOne(id: string): Promise<{
        representative: {
            email: string;
            name: string;
            id: string;
        } | null;
        reads: {
            representativeId: string;
            readAt: Date;
        }[];
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        representativeId: string | null;
        message: string;
        priority: import(".prisma/client").$Enums.AnnouncementPriority;
    }>;
    remove(id: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        representativeId: string | null;
        message: string;
        priority: import(".prisma/client").$Enums.AnnouncementPriority;
    }>;
    findForRepresentative(representativeId: string): Promise<({
        reads: {
            readAt: Date;
        }[];
    } & {
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        representativeId: string | null;
        message: string;
        priority: import(".prisma/client").$Enums.AnnouncementPriority;
    })[]>;
    markAsRead(announcementId: string, representativeId: string): Promise<{
        id: string;
        representativeId: string;
        announcementId: string;
        readAt: Date;
    }>;
    countUnread(representativeId: string): Promise<{
        unread: number;
    }>;
}
