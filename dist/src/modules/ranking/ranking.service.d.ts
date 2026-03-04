import { PrismaService } from '../../config/prisma.service';
export declare class RankingService {
    private prisma;
    constructor(prisma: PrismaService);
    getRanking(period?: string): Promise<{
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
    getBadges(representativeId: string): Promise<{
        id: string;
        representativeId: string;
        badgeKey: string;
        badgeName: string;
        badgeDescription: string;
        badgeIcon: string;
        earnedAt: Date;
    }[]>;
    private badgeDefinitions;
    checkAndAwardBadges(representativeId: string): Promise<any[]>;
    getGoals(representativeId: string): Promise<{
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
    createGoal(data: {
        representativeId: string;
        title: string;
        type: string;
        targetValue: number;
        unit: string;
        periodStart: string;
        periodEnd: string;
        createdByUserId?: string;
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
    updateGoalProgress(goalId: string, currentValue: number): Promise<{
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
    getAllGoals(filters?: {
        representativeId?: string;
        status?: string;
    }): Promise<({
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
    private getDateFilter;
}
