import { ActivityLogService } from './activity-log.service';
export declare class ActivityLogController {
    private readonly service;
    constructor(service: ActivityLogService);
    getMyTimeline(req: any, limit?: string): Promise<{
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
    getGlobalTimeline(entityType?: string, action?: string, representativeId?: string, startDate?: string, endDate?: string, limit?: string): Promise<({
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
    getStats(days?: string): Promise<{
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
