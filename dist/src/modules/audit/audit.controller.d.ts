import { PrismaService } from '../../config/prisma.service';
export declare class AuditController {
    private prisma;
    constructor(prisma: PrismaService);
    getAuditLogs(req: any, page?: string, limit?: string, userId?: string, action?: string, entityType?: string, startDate?: string, endDate?: string): Promise<{
        logs: {
            id: string;
            action: string;
            entityType: string;
            entityId: string | null;
            oldValues: import("@prisma/client/runtime/library").JsonValue;
            newValues: import("@prisma/client/runtime/library").JsonValue;
            ipAddress: string | null;
            userAgent: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
            user: {
                email: string;
                name: string | null;
                role: import(".prisma/client").$Enums.UserRole;
                id: string;
            } | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    getAuditStatistics(req: any): Promise<{
        totalLogs: number;
        actionsByType: {
            action: string;
            count: number;
        }[];
        topUsers: ({
            userId: null;
            name: string;
            email: string;
            role: string;
            actionCount: number;
        } | {
            userId: string;
            name: string;
            email: string;
            role: string;
            actionCount: number;
        })[];
        recentActivity: number;
        securityEvents: number;
        lastUpdated: string;
    }>;
    getUserAuditLogs(req: any, page?: string, limit?: string): Promise<{
        logs: {
            id: string;
            action: string;
            entityType: string;
            entityId: string | null;
            oldValues: import("@prisma/client/runtime/library").JsonValue;
            newValues: import("@prisma/client/runtime/library").JsonValue;
            ipAddress: string | null;
            userAgent: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue;
            createdAt: Date;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
}
