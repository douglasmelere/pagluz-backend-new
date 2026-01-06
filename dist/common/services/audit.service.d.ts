import { PrismaService } from '../../config/prisma.service';
export interface AuditLogData {
    userId?: string;
    representativeId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
}
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(data: AuditLogData): Promise<void>;
    logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logLogout(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logCreate(userId: string, entityType: string, entityId: string, newValues: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logUpdate(userId: string, entityType: string, entityId: string, oldValues: any, newValues: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logDelete(userId: string, entityType: string, entityId: string, oldValues: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logSecurityEvent(userId: string | undefined, action: string, details: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logRepresentativeLogin(representativeId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logRepresentativeLogout(representativeId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logRepresentativeCreate(representativeId: string, entityType: string, entityId: string, newValues: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logRepresentativeUpdate(representativeId: string, entityType: string, entityId: string, oldValues: any, newValues: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logRepresentativeDelete(representativeId: string, entityType: string, entityId: string, oldValues: any, ipAddress?: string, userAgent?: string): Promise<void>;
}
