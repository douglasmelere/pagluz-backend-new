import { Injectable } from '@nestjs/common';
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

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    try {
      // Se for um representante, não incluir userId para evitar foreign key constraint
      const metadata = {
        ...data.metadata,
        ...(data.representativeId && { representativeId: data.representativeId })
      };

      await this.prisma.auditLog.create({
        data: {
          userId: data.userId || null, // Só inclui se for um usuário real da tabela users
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          oldValues: data.oldValues || null,
          newValues: data.newValues || null,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          metadata: metadata,
        },
      });
    } catch (error) {
      // Log do erro mas não falha a operação principal
      console.error('Erro ao registrar log de auditoria:', error);
    }
  }

  async logLogin(userId: string, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId,
      action: 'LOGIN',
      entityType: 'User',
      entityId: userId,
      ipAddress,
      userAgent,
      metadata: { timestamp: new Date().toISOString() },
    });
  }

  async logLogout(userId: string, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: userId,
      ipAddress,
      userAgent,
      metadata: { timestamp: new Date().toISOString() },
    });
  }

  async logCreate(userId: string, entityType: string, entityId: string, newValues: any, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId,
      action: 'CREATE',
      entityType,
      entityId,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  async logUpdate(userId: string, entityType: string, entityId: string, oldValues: any, newValues: any, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId,
      action: 'UPDATE',
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  async logDelete(userId: string, entityType: string, entityId: string, oldValues: any, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId,
      action: 'DELETE',
      entityType,
      entityId,
      oldValues,
      ipAddress,
      userAgent,
    });
  }

  async logSecurityEvent(userId: string | undefined, action: string, details: any, ipAddress?: string, userAgent?: string) {
    await this.log({
      userId,
      action,
      entityType: 'Security',
      metadata: details,
      ipAddress,
      userAgent,
    });
  }

  // Métodos específicos para representantes
  async logRepresentativeLogin(representativeId: string, ipAddress?: string, userAgent?: string) {
    await this.log({
      representativeId,
      action: 'LOGIN',
      entityType: 'Representative',
      entityId: representativeId,
      ipAddress,
      userAgent,
      metadata: { timestamp: new Date().toISOString(), userType: 'representative' },
    });
  }

  async logRepresentativeLogout(representativeId: string, ipAddress?: string, userAgent?: string) {
    await this.log({
      representativeId,
      action: 'LOGOUT',
      entityType: 'Representative',
      entityId: representativeId,
      ipAddress,
      userAgent,
      metadata: { timestamp: new Date().toISOString(), userType: 'representative' },
    });
  }

  async logRepresentativeCreate(representativeId: string, entityType: string, entityId: string, newValues: any, ipAddress?: string, userAgent?: string) {
    await this.log({
      representativeId,
      action: 'CREATE',
      entityType,
      entityId,
      newValues,
      ipAddress,
      userAgent,
      metadata: { userType: 'representative' },
    });
  }

  async logRepresentativeUpdate(representativeId: string, entityType: string, entityId: string, oldValues: any, newValues: any, ipAddress?: string, userAgent?: string) {
    await this.log({
      representativeId,
      action: 'UPDATE',
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      metadata: { userType: 'representative' },
    });
  }

  async logRepresentativeDelete(representativeId: string, entityType: string, entityId: string, oldValues: any, ipAddress?: string, userAgent?: string) {
    await this.log({
      representativeId,
      action: 'DELETE',
      entityType,
      entityId,
      oldValues,
      ipAddress,
      userAgent,
      metadata: { userType: 'representative' },
    });
  }
}
