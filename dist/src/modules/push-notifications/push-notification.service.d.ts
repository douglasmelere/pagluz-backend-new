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
        message: string;
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
