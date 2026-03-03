import { AdminNotificationsService } from './admin-notifications.service';
export declare class AdminNotificationsController {
    private readonly service;
    constructor(service: AdminNotificationsService);
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
