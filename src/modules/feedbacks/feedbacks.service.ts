import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RespondFeedbackDto } from './dto/respond-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';

@Injectable()
export class FeedbacksService {
  constructor(private prisma: PrismaService) { }

  // ────────────────────────────────────────────────────────────────────────────
  // Representante: Criar feedback
  // ────────────────────────────────────────────────────────────────────────────

  async create(representativeId: string, dto: CreateFeedbackDto) {
    return this.prisma.feedback.create({
      data: {
        representativeId,
        type: dto.type as any,
        subject: dto.subject,
        description: dto.description,
        category: dto.category ?? null,
        attachmentUrl: dto.attachmentUrl ?? null,
        attachmentFileName: dto.attachmentFileName ?? null,
      },
      include: {
        representative: { select: { id: true, name: true, email: true } },
        responses: true,
      },
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Representante: Listar seus feedbacks
  // ────────────────────────────────────────────────────────────────────────────

  async findByRepresentative(representativeId: string) {
    return this.prisma.feedback.findMany({
      where: { representativeId },
      orderBy: { createdAt: 'desc' },
      include: {
        responses: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Representante: Ver detalhes de um feedback
  // ────────────────────────────────────────────────────────────────────────────

  async findOneByRepresentative(feedbackId: string, representativeId: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        representative: { select: { id: true, name: true, email: true } },
        responses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback não encontrado.');
    }

    if (feedback.representativeId !== representativeId) {
      throw new ForbiddenException('Você não tem permissão para acessar este feedback.');
    }

    return feedback;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Representante: Responder no thread do próprio feedback
  // ────────────────────────────────────────────────────────────────────────────

  async respondAsRepresentative(
    feedbackId: string,
    representativeId: string,
    representativeName: string,
    dto: RespondFeedbackDto,
  ) {
    // Verifica se o feedback pertence ao representante
    const feedback = await this.findOneByRepresentative(feedbackId, representativeId);

    // Não permite responder se já está RESOLVED ou REJECTED
    if (feedback.status === 'RESOLVED' || feedback.status === 'REJECTED') {
      throw new ForbiddenException('Este feedback já foi encerrado e não aceita novas respostas.');
    }

    // Garante que temos o nome do representante
    let authorName = representativeName;
    if (!authorName) {
      const rep = await this.prisma.representative.findUnique({
        where: { id: representativeId },
        select: { name: true },
      });
      authorName = rep?.name || 'Representante';
    }

    return this.prisma.feedbackResponse.create({
      data: {
        feedbackId,
        message: dto.message,
        authorType: 'REPRESENTATIVE',
        authorId: representativeId,
        authorName,
      },
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Representante: Contar feedbacks abertos / com respostas novas
  // ────────────────────────────────────────────────────────────────────────────

  async countByRepresentative(representativeId: string) {
    const [total, open, inAnalysis, resolved, rejected] = await Promise.all([
      this.prisma.feedback.count({ where: { representativeId } }),
      this.prisma.feedback.count({ where: { representativeId, status: 'OPEN' } }),
      this.prisma.feedback.count({ where: { representativeId, status: 'IN_ANALYSIS' } }),
      this.prisma.feedback.count({ where: { representativeId, status: 'RESOLVED' } }),
      this.prisma.feedback.count({ where: { representativeId, status: 'REJECTED' } }),
    ]);

    return { total, open, inAnalysis, resolved, rejected };
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  ADMIN
  // ════════════════════════════════════════════════════════════════════════════

  // ────────────────────────────────────────────────────────────────────────────
  // Admin: Listar todos os feedbacks com filtros
  // ────────────────────────────────────────────────────────────────────────────

  async findAll(filters?: {
    status?: string;
    type?: string;
    priority?: string;
    representativeId?: string;
  }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.type) where.type = filters.type;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.representativeId) where.representativeId = filters.representativeId;

    return this.prisma.feedback.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // OPEN primeiro
        { createdAt: 'desc' },
      ],
      include: {
        representative: { select: { id: true, name: true, email: true, phone: true } },
        responses: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Admin: Ver detalhes de um feedback
  // ────────────────────────────────────────────────────────────────────────────

  async findOne(feedbackId: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: {
        representative: { select: { id: true, name: true, email: true, phone: true, city: true, state: true } },
        responses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback não encontrado.');
    }

    return feedback;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Admin: Atualizar status e prioridade
  // ────────────────────────────────────────────────────────────────────────────

  async updateStatus(feedbackId: string, dto: UpdateFeedbackStatusDto, adminUserId: string) {
    await this.findOne(feedbackId);

    const data: any = { status: dto.status };
    if (dto.priority) data.priority = dto.priority;

    // Se o status mudou para RESOLVED ou REJECTED, registra quem resolveu
    if (dto.status === 'RESOLVED' || dto.status === 'REJECTED') {
      data.resolvedAt = new Date();
      data.resolvedByUserId = adminUserId;
    }

    // Se reabriram (voltou para OPEN), limpa resolução
    if (dto.status === 'OPEN') {
      data.resolvedAt = null;
      data.resolvedByUserId = null;
    }

    return this.prisma.feedback.update({
      where: { id: feedbackId },
      data,
      include: {
        representative: { select: { id: true, name: true, email: true } },
        responses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Admin: Responder feedback
  // ────────────────────────────────────────────────────────────────────────────

  async respondAsAdmin(
    feedbackId: string,
    adminId: string,
    adminName: string,
    dto: RespondFeedbackDto,
  ) {
    await this.findOne(feedbackId);

    // Ao responder, move o status para IN_ANALYSIS se estiver OPEN
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (feedback?.status === 'OPEN') {
      await this.prisma.feedback.update({
        where: { id: feedbackId },
        data: { status: 'IN_ANALYSIS' },
      });
    }

    // Garante que temos o nome do admin
    let authorName = adminName;
    if (!authorName) {
      const user = await this.prisma.user.findUnique({
        where: { id: adminId },
        select: { name: true },
      });
      authorName = user?.name || 'Administrador';
    }

    return this.prisma.feedbackResponse.create({
      data: {
        feedbackId,
        message: dto.message,
        authorType: 'ADMIN',
        authorId: adminId,
        authorName,
      },
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Admin: Excluir feedback
  // ────────────────────────────────────────────────────────────────────────────

  async remove(feedbackId: string) {
    await this.findOne(feedbackId);
    return this.prisma.feedback.delete({ where: { id: feedbackId } });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Admin: Métricas globais dos feedbacks
  // ────────────────────────────────────────────────────────────────────────────

  async getMetrics() {
    const [total, open, inAnalysis, resolved, rejected] = await Promise.all([
      this.prisma.feedback.count(),
      this.prisma.feedback.count({ where: { status: 'OPEN' } }),
      this.prisma.feedback.count({ where: { status: 'IN_ANALYSIS' } }),
      this.prisma.feedback.count({ where: { status: 'RESOLVED' } }),
      this.prisma.feedback.count({ where: { status: 'REJECTED' } }),
    ]);

    const byType = await this.prisma.feedback.groupBy({
      by: ['type'],
      _count: { id: true },
    });

    const byPriority = await this.prisma.feedback.groupBy({
      by: ['priority'],
      _count: { id: true },
    });

    // Tempo médio de resolução (em horas)
    const resolvedFeedbacks = await this.prisma.feedback.findMany({
      where: { status: 'RESOLVED', resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
    });

    let avgResolutionHours = 0;
    if (resolvedFeedbacks.length > 0) {
      const totalHours = resolvedFeedbacks.reduce((sum, f) => {
        const diff = (f.resolvedAt!.getTime() - f.createdAt.getTime()) / (1000 * 60 * 60);
        return sum + diff;
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolvedFeedbacks.length) * 10) / 10;
    }

    return {
      total,
      open,
      inAnalysis,
      resolved,
      rejected,
      byType: byType.map(t => ({ type: t.type, count: t._count.id })),
      byPriority: byPriority.map(p => ({ priority: p.priority, count: p._count.id })),
      avgResolutionHours,
    };
  }
}
