import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { PushNotificationService } from '../push-notifications/push-notification.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    private prisma: PrismaService,
    private pushNotificationService: PushNotificationService,
  ) { }

  // ─── Admin: Criar comunicado ──────────────────────────────────────────────────

  async create(dto: CreateAnnouncementDto) {
    // Valida representante se informado
    if (dto.representativeId) {
      const rep = await this.prisma.representative.findUnique({
        where: { id: dto.representativeId },
      });
      if (!rep) throw new NotFoundException('Representante não encontrado.');
    }

    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        message: dto.message,
        priority: dto.priority ?? 'NORMAL',
        representativeId: dto.representativeId ?? null,
      },
      include: {
        representative: { select: { id: true, name: true, email: true } },
      },
    });

    // Enviar notificação push
    const emoji = dto.priority === 'HIGH' ? '🚨' : '📢';
    if (dto.representativeId) {
      await this.pushNotificationService.sendToRepresentative(
        dto.representativeId,
        {
          title: `Novo Comunicado ${emoji}`,
          body: dto.title
        }
      );
    } else {
      await this.pushNotificationService.sendToAll({
        title: `Aviso Importante ${emoji}`,
        body: dto.title
      });
    }

    return announcement;
  }

  // ─── Admin: Listar todos os comunicados ───────────────────────────────────────

  async findAll() {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        representative: { select: { id: true, name: true, email: true } },
        reads: { select: { representativeId: true, readAt: true } },
      },
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        representative: { select: { id: true, name: true, email: true } },
        reads: { select: { representativeId: true, readAt: true } },
      },
    });
    if (!announcement) throw new NotFoundException('Comunicado não encontrado.');
    return announcement;
  }

  // ─── Admin: Excluir comunicado ────────────────────────────────────────────────

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.announcement.delete({ where: { id } });
  }

  // ─── Representante: Listar comunicados visíveis para ele ─────────────────────

  async findForRepresentative(representativeId: string) {
    return this.prisma.announcement.findMany({
      where: {
        OR: [
          { representativeId: null },              // Comunicados para todos
          { representativeId: representativeId },  // Comunicados específicos para ele
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        reads: {
          where: { representativeId },
          select: { readAt: true },
        },
      },
    });
  }

  // ─── Representante: Marcar comunicado como lido ───────────────────────────────

  async markAsRead(announcementId: string, representativeId: string) {
    await this.findOne(announcementId);

    return this.prisma.announcementRead.upsert({
      where: {
        announcementId_representativeId: { announcementId, representativeId },
      },
      update: { readAt: new Date() },
      create: { announcementId, representativeId },
    });
  }

  // ─── Representante: Contar não lidos ──────────────────────────────────────────

  async countUnread(representativeId: string): Promise<{ unread: number }> {
    const visible = await this.prisma.announcement.findMany({
      where: {
        OR: [
          { representativeId: null },
          { representativeId },
        ],
      },
      select: { id: true },
    });

    const visibleIds = visible.map((a) => a.id);

    const readCount = await this.prisma.announcementRead.count({
      where: { representativeId, announcementId: { in: visibleIds } },
    });

    return { unread: visibleIds.length - readCount };
  }
}
