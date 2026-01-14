import { HealthCheckService } from '@nestjs/terminus';
import { PrismaService } from '../../config/prisma.service';
export declare class HealthController {
    private health;
    private prismaService;
    constructor(health: HealthCheckService, prismaService: PrismaService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    readiness(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    liveness(): {
        status: string;
        timestamp: string;
    };
}
