import { PrismaService } from '../../config/prisma.service';
export declare class AdminNotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        title: string;
        message: string;
    }): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        isRead: boolean;
    }>;
    findAll(): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        isRead: boolean;
    }[]>;
    findUnread(): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        isRead: boolean;
    }[]>;
    markAsRead(id: string): Promise<{
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        isRead: boolean;
    }>;
}
