import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { AuditService } from './audit.service';
import * as crypto from 'crypto';

@Injectable()
export class LogoutService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async logout(userId: string, token: string, ipAddress?: string, userAgent?: string) {
    try {
      // Gera hash do token para armazenar na blacklist
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // Extrai informações do token JWT (payload)
      const payload = this.extractPayloadFromToken(token);
      const expiresAt = payload ? new Date(payload.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Adiciona token à blacklist
      await this.prisma.blacklistedToken.create({
        data: {
          token: tokenHash,
          userId,
          expiresAt,
          reason: 'LOGOUT',
        },
      });

      // Registra logout no log de auditoria
      await this.auditService.logLogout(userId, ipAddress, userAgent);

      // Atualiza estatísticas do usuário
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date(),
        },
      });

      return { message: 'Logout realizado com sucesso' };
    } catch (error) {
      console.error('Erro durante logout:', error);
      throw new UnauthorizedException('Erro durante logout');
    }
  }

  async invalidateToken(token: string, userId: string, reason: string = 'SECURITY') {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const payload = this.extractPayloadFromToken(token);
      const expiresAt = payload ? new Date(payload.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

      await this.prisma.blacklistedToken.create({
        data: {
          token: tokenHash,
          userId,
          expiresAt,
          reason,
        },
      });

      // Registra evento de segurança
      await this.auditService.logSecurityEvent(userId, 'TOKEN_INVALIDATED', { reason, tokenHash }, undefined, undefined);

      return { message: 'Token invalidado com sucesso' };
    } catch (error) {
      console.error('Erro ao invalidar token:', error);
      throw new UnauthorizedException('Erro ao invalidar token');
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      const blacklistedToken = await this.prisma.blacklistedToken.findUnique({
        where: { token: tokenHash },
      });

      if (!blacklistedToken) {
        return false;
      }

      // Remove tokens expirados da blacklist
      if (blacklistedToken.expiresAt < new Date()) {
        await this.prisma.blacklistedToken.delete({
          where: { id: blacklistedToken.id },
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar blacklist:', error);
      return false;
    }
  }

  async cleanupExpiredTokens() {
    try {
      const result = await this.prisma.blacklistedToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      console.log(`Limpeza de tokens expirados: ${result.count} tokens removidos`);
      return result.count;
    } catch (error) {
      console.error('Erro na limpeza de tokens:', error);
      return 0;
    }
  }

  private extractPayloadFromToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const payload = parts[1];
      const decoded = Buffer.from(payload, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  async forceLogoutAllSessions(userId: string, reason: string = 'SECURITY_ADMIN') {
    try {
      // Registra evento de segurança
      await this.auditService.logSecurityEvent(userId, 'FORCE_LOGOUT_ALL', { reason }, undefined, undefined);

      // Atualiza usuário para indicar que todas as sessões foram invalidadas
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: new Date(),
        },
      });

      return { message: 'Todas as sessões foram invalidadas' };
    } catch (error) {
      console.error('Erro ao forçar logout de todas as sessões:', error);
      throw new UnauthorizedException('Erro ao invalidar sessões');
    }
  }
}
