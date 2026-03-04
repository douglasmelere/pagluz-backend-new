import { RankingService } from './ranking.service';
export declare class RankingController {
    private readonly service;
    constructor(service: RankingService);
    getLeaderboard(period?: string): Promise<{
        position: number;
        id: string;
        name: string;
        email: string;
        city: string;
        state: string;
        avatarUrl: string | null;
        totalClients: number;
        convertedClients: number;
        allocatedClients: number;
        totalKwh: number;
        totalCommissions: number;
        paidCommissions: number;
        conversionRate: number;
        badgesCount: number;
        score: number;
    }[]>;
    getMyBadges(req: any): Promise<{
        id: string;
        representativeId: string;
        badgeKey: string;
        badgeName: string;
        badgeDescription: string;
        badgeIcon: string;
        earnedAt: Date;
    }[]>;
    checkMyBadges(req: any): Promise<any[]>;
    getMyGoals(req: any): Promise<{
        progressPercent: number;
        type: import(".prisma/client").$Enums.GoalType;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        representativeId: string;
        targetValue: number;
        currentValue: number;
        unit: string;
        periodStart: Date;
        periodEnd: Date;
        createdByUserId: string | null;
    }[]>;
    getAdminLeaderboard(period?: string): Promise<{
        position: number;
        id: string;
        name: string;
        email: string;
        city: string;
        state: string;
        avatarUrl: string | null;
        totalClients: number;
        convertedClients: number;
        allocatedClients: number;
        totalKwh: number;
        totalCommissions: number;
        paidCommissions: number;
        conversionRate: number;
        badgesCount: number;
        score: number;
    }[]>;
    getAllGoals(representativeId?: string, status?: string): Promise<({
        representative: {
            email: string;
            name: string;
            id: string;
        };
    } & {
        type: import(".prisma/client").$Enums.GoalType;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        representativeId: string;
        targetValue: number;
        currentValue: number;
        unit: string;
        periodStart: Date;
        periodEnd: Date;
        createdByUserId: string | null;
    })[]>;
    createGoal(body: any, req: any): Promise<{
        type: import(".prisma/client").$Enums.GoalType;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        representativeId: string;
        targetValue: number;
        currentValue: number;
        unit: string;
        periodStart: Date;
        periodEnd: Date;
        createdByUserId: string | null;
    }>;
    updateGoalProgress(id: string, body: {
        currentValue: number;
    }): Promise<{
        type: import(".prisma/client").$Enums.GoalType;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.GoalStatus;
        representativeId: string;
        targetValue: number;
        currentValue: number;
        unit: string;
        periodStart: Date;
        periodEnd: Date;
        createdByUserId: string | null;
    }>;
    checkBadges(id: string): Promise<any[]>;
}
