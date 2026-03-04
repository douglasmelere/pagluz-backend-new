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
        reason: string;
        tokens: number;
        notification?: undefined;
        message?: undefined;
    } | {
        sent: boolean;
        tokens: number;
        notification: {
            title: string;
            body: string;
            data?: Record<string, string>;
        };
        message: string;
        reason?: undefined;
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
        message: string;
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
