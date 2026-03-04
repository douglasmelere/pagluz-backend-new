import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import * as admin from 'firebase-admin';

try {
  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('✅ Firebase Admin SDK inicializado');
    } else {
      console.warn('⚠️ Firebase Admin SDK não configurado: Variáveis de ambiente ausentes.');
    }
  }
} catch (e) {
  console.error('⚠️ Firebase Admin SDK não configurado:', e.message);
}

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

    try {
      const messages = tokens.map(t => ({
        token: t.token,
        notification: { title: notification.title, body: notification.body },
        data: notification.data || {},
      }));

      const response = await admin.messaging().sendEach(messages);

      // Cleanup invalid tokens if any failures occur
      if (response.failureCount > 0) {
        response.responses.forEach(async (resp, idx) => {
          if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
            await this.removeToken(messages[idx].token);
          }
        });
      }

      return {
        sent: true,
        tokens: tokens.length,
        notification,
        successCount: response.successCount,
        failureCount: response.failureCount,
        message: 'Notificação enviada com sucesso.',
      };
    } catch (e) {
      console.error('Erro ao enviar push notification:', e);
      return { sent: false, reason: e.message, tokens: tokens.length };
    }
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

    if (allTokens.length === 0) {
      return { sent: false, reason: 'Nenhum token registrado no sistema', totalTokens: 0 };
    }

    try {
      const messages = allTokens.map(t => ({
        token: t.token,
        notification: { title: notification.title, body: notification.body },
        data: notification.data || {},
      }));

      // Firebase limit is 500 per batch. Here we just rely on sendEach which handles array of messages
      // but if there are > 500 we should chunk. Since we might not have 500 yet, it's fine for now.
      // Better chunking:
      const chunkSize = 500;
      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < messages.length; i += chunkSize) {
        const chunk = messages.slice(i, i + chunkSize);
        const response = await admin.messaging().sendEach(chunk);
        successCount += response.successCount;
        failureCount += response.failureCount;

        if (response.failureCount > 0) {
          response.responses.forEach(async (resp, idx) => {
            if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
              await this.removeToken(chunk[idx].token);
            }
          });
        }
      }

      return {
        sent: true,
        totalTokens: allTokens.length,
        uniqueRepresentatives: new Set(allTokens.map(t => t.representativeId)).size,
        notification,
        successCount,
        failureCount,
        message: 'Notificação em massa enviada com sucesso.',
      };
    } catch (e) {
      console.error('Erro ao enviar push notification list:', e);
      return { sent: false, reason: e.message, totalTokens: allTokens.length };
    }
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
