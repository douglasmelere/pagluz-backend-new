import { PrismaService } from '../../config/prisma.service';
import { AuditService } from './audit.service';
export declare class LogoutService {
    private prisma;
    private auditService;
    constructor(prisma: PrismaService, auditService: AuditService);
    logout(userId: string, token: string, ipAddress?: string, userAgent?: string): Promise<{
        message: string;
    }>;
    invalidateToken(token: string, userId: string, reason?: string): Promise<{
        message: string;
    }>;
    isTokenBlacklisted(token: string): Promise<boolean>;
    cleanupExpiredTokens(): Promise<number>;
    private extractPayloadFromToken;
    forceLogoutAllSessions(userId: string, reason?: string): Promise<{
        message: string;
    }>;
}
