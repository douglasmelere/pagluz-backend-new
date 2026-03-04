import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class PushNotificationService {
  constructor(private prisma: PrismaService) { }

  // ─── Registrar token de push ────────────────────────────────────────────────

  async registerToken(representativeId: string, data: {
    token: string;
    platform: string;
    deviceName?: string;
  }) {
    // Upsert: se o token já existe, atualiza
    return this.prisma.pushToken.upsert({
      where: { token: data.token },
      update: {
        representativeId,
        platform: data.platform,
        deviceName: data.deviceName ?? null,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        representativeId,
        token: data.token,
        platform: data.platform,
        deviceName: data.deviceName ?? null,
      },
    });
  }

  // ─── Remover token ──────────────────────────────────────────────────────────

  async removeToken(token: string) {
    const existing = await this.prisma.pushToken.findUnique({ where: { token } });
    if (!existing) throw new NotFoundException('Token não encontrado');
    return this.prisma.pushToken.delete({ where: { token } });
  }

  // ─── Desativar token ────────────────────────────────────────────────────────

  async deactivateToken(token: string) {
    return this.prisma.pushToken.update({
      where: { token },
      data: { isActive: false },
    });
  }

  // ─── Listar tokens de um representante ──────────────────────────────────────

  async getTokens(representativeId: string) {
    return this.prisma.pushToken.findMany({
      where: { representativeId, isActive: true },
    });
  }

  // ─── Enviar notificação (placeholder — integrar com FCM) ────────────────────
  //     Aqui retornamos os dados que seriam enviados.
  //     Para integrar com Firebase Cloud Messaging, basta adicionar:
  //     npm install firebase-admin
  //     E então usar admin.messaging().send() aqui.

  async sendToRepresentative(representativeId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    const tokens = await this.getTokens(representativeId);

    if (tokens.length === 0) {
      return { sent: false, reason: 'Nenhum token registrado', tokens: 0 };
    }

    // TODO: Integrar com Firebase Cloud Messaging
    // const messages = tokens.map(t => ({
    //   token: t.token,
    //   notification: { title: notification.title, body: notification.body },
    //   data: notification.data,
    // }));
    // await admin.messaging().sendEach(messages);

    return {
      sent: true,
      tokens: tokens.length,
      notification,
      message: 'Notificação enfileirada. Integre com FCM para envio real.',
    };
  }

  // ─── Enviar para todos os representantes ────────────────────────────────────

  async sendToAll(notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    const allTokens = await this.prisma.pushToken.findMany({
      where: { isActive: true },
      select: { token: true, representativeId: true },
    });

    return {
      sent: true,
      totalTokens: allTokens.length,
      uniqueRepresentatives: new Set(allTokens.map(t => t.representativeId)).size,
      notification,
      message: 'Notificação em massa enfileirada. Integre com FCM para envio real.',
    };
  }

  // ─── Admin: Estatísticas de tokens ──────────────────────────────────────────

  async getTokenStats() {
    const [total, active, byPlatform] = await Promise.all([
      this.prisma.pushToken.count(),
      this.prisma.pushToken.count({ where: { isActive: true } }),
      this.prisma.pushToken.groupBy({
        by: ['platform'],
        where: { isActive: true },
        _count: { id: true },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      byPlatform: byPlatform.map(p => ({ platform: p.platform, count: p._count.id })),
    };
  }
}
