import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
export declare class AnnouncementsController {
    private readonly service;
    constructor(service: AnnouncementsService);
    findForRepresentative(req: any): Promise<({
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
    countUnread(req: any): Promise<{
        unread: number;
    }>;
    markAsRead(id: string, req: any): Promise<{
        id: string;
        representativeId: string;
        announcementId: string;
        readAt: Date;
    }>;
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
}
