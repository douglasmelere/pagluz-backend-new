import { PushNotificationService } from './push-notification.service';
export declare class PushNotificationController {
    private readonly service;
    constructor(service: PushNotificationService);
    register(req: any, body: {
        token: string;
        platform: string;
        deviceName?: string;
    }): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        representativeId: string;
        platform: string;
        deviceName: string | null;
    }>;
    unregister(token: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        representativeId: string;
        platform: string;
        deviceName: string | null;
    }>;
    myTokens(req: any): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        representativeId: string;
        platform: string;
        deviceName: string | null;
    }[]>;
    sendToOne(representativeId: string, body: {
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<{
        sent: boolean;
        tokens: number;
        notification: {
            title: string;
            body: string;
            data?: Record<string, string>;
        };
        successCount: number;
        failureCount: number;
        message: string;
        reason?: undefined;
    } | {
        sent: boolean;
        reason: any;
        tokens: number;
        notification?: undefined;
        successCount?: undefined;
        failureCount?: undefined;
        message?: undefined;
    }>;
    sendToAll(body: {
        title: string;
        body: string;
        data?: Record<string, string>;
    }): Promise<{
        sent: boolean;
        totalTokens: number;
        uniqueRepresentatives: number;
        notification: {
            title: string;
            body: string;
            data?: Record<string, string>;
        };
        successCount: number;
        failureCount: number;
        message: string;
        reason?: undefined;
    } | {
        sent: boolean;
        reason: any;
        totalTokens: number;
        uniqueRepresentatives?: undefined;
        notification?: undefined;
        successCount?: undefined;
        failureCount?: undefined;
        message?: undefined;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byPlatform: {
            platform: string;
            count: number;
        }[];
    }>;
}
