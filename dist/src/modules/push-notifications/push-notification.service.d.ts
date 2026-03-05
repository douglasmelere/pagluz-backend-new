import { PrismaService } from '../../config/prisma.service';
export declare class PushNotificationService {
    private prisma;
    constructor(prisma: PrismaService);
    registerToken(representativeId: string, data: {
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
    removeToken(token: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        representativeId: string;
        platform: string;
        deviceName: string | null;
    }>;
    deactivateToken(token: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        representativeId: string;
        platform: string;
        deviceName: string | null;
    }>;
    getTokens(representativeId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        token: string;
        representativeId: string;
        platform: string;
        deviceName: string | null;
    }[]>;
    sendToRepresentative(representativeId: string, notification: {
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
    sendToAll(notification: {
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
    getTokenStats(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byPlatform: {
            platform: string;
            count: number;
        }[];
    }>;
}
