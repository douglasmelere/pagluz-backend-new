import { PrismaService } from '../../config/prisma.service';
export declare class ActivityLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(data: {
        entityType: string;
        entityId: string;
        action: string;
        description: string;
        representativeId?: string;
        performedBy?: string;
        performedByName?: string;
        performedByRole?: string;
        details?: any;
    }): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        representativeId: string | null;
        action: string;
        entityType: string;
        entityId: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        performedBy: string | null;
        performedByName: string | null;
        performedByRole: string | null;
    }>;
    getEntityTimeline(entityType: string, entityId: string): Promise<({
        representative: {
            name: string;
            id: string;
        } | null;
    } & {
        description: string;
        id: string;
        createdAt: Date;
        representativeId: string | null;
        action: string;
        entityType: string;
        entityId: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        performedBy: string | null;
        performedByName: string | null;
        performedByRole: string | null;
    })[]>;
    getRepresentativeTimeline(representativeId: string, limit?: number): Promise<{
        description: string;
        id: string;
        createdAt: Date;
        representativeId: string | null;
        action: string;
        entityType: string;
        entityId: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        performedBy: string | null;
        performedByName: string | null;
        performedByRole: string | null;
    }[]>;
    getGlobalTimeline(filters: {
        entityType?: string;
        action?: string;
        representativeId?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<({
        representative: {
            name: string;
            id: string;
            avatarUrl: string | null;
        } | null;
    } & {
        description: string;
        id: string;
        createdAt: Date;
        representativeId: string | null;
        action: string;
        entityType: string;
        entityId: string;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        performedBy: string | null;
        performedByName: string | null;
        performedByRole: string | null;
    })[]>;
    getActivityStats(days?: number): Promise<{
        totalActivities: number;
        byEntityType: {
            type: string;
            count: number;
        }[];
        byAction: {
            action: string;
            count: number;
        }[];
        period: string;
    }>;
}
