import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateProposalRequestDto } from './dto/create-proposal-request.dto';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Response } from 'express';
import { WebhookService } from '../../common/services/webhook.service';
import { PushNotificationService } from '../push-notifications/push-notification.service';

@Injectable()
export class ProposalRequestsService {
  private supabase: SupabaseClient;
  private readonly BUCKET_NAME = 'propostas-representantes';

  constructor(
    private prisma: PrismaService,
    private notificationsService: AdminNotificationsService,
    private configService: ConfigService,
    private webhookService: WebhookService,
    private pushNotificationService: PushNotificationService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL e chave do Supabase devem estar configuradas no .env');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async create(representativeId: string, dto: CreateProposalRequestDto) {
    const representative = await this.prisma.representative.findUnique({
      where: { id: representativeId },
      select: { name: true }
    });

    if (!representative) throw new NotFoundException('Representative not found');

    const request = await this.prisma.proposalRequest.create({
      data: {
        ...dto,
        representativeId,
      },
      include: { representative: { select: { name: true } } }
    });

    await this.notificationsService.create({
      title: 'Nova Solicitação de Proposta',
      message: `O representante ${representative.name} solicitou uma proposta para o cliente ${dto.clientName}.`,
    });

    // Envia notificação por webhook
    await this.webhookService.sendNotification('PROPOSTA_SOLICITADA', {
      requestId: request.id,
      clientName: dto.clientName,
      representativeName: representative.name,
      invoiceAmount: dto.invoiceAmount,
      kwhValue: dto.kwhValue,
    });

    return request;
  }

  async findAll() {
    return this.prisma.proposalRequest.findMany({
      include: { representative: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByRepresentative(representativeId: string) {
    return this.prisma.proposalRequest.findMany({
      where: { representativeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsGenerated(id: string, file?: Express.Multer.File) {
    const request = await this.prisma.proposalRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Solicitação não encontrada');

    let documentUrl: string | null = request.documentUrl;
    let documentFileName: string | null = request.documentFileName;
    let documentUploadedAt: Date | null = request.documentUploadedAt;

    if (file) {
      const ext = file.originalname.split('.').pop()?.toLowerCase();
      const uniqueFileName = `${id}-${Date.now()}.${ext}`;

      const { data, error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .upload(uniqueFileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) throw new Error(`Erro ao subir arquivo: ${error.message}`);

      const publicResult = this.supabase.storage.from(this.BUCKET_NAME).getPublicUrl(uniqueFileName);

      documentUrl = publicResult.data.publicUrl;
      documentFileName = file.originalname;
      documentUploadedAt = new Date();
    }

    const updated = await this.prisma.proposalRequest.update({
      where: { id },
      data: {
        status: 'GENERATED',
        documentUrl,
        documentFileName,
        documentUploadedAt
      },
      include: { representative: { select: { name: true } } }
    });

    // Notificar representante
    if (updated.representativeId) {
      await this.pushNotificationService.sendToRepresentative(
        updated.representativeId,
        {
          title: 'Proposta Gerada! 📄',
          body: `A proposta para o cliente ${updated.clientName} está pronta e disponível no seu painel.`
        }
      );
    }

    return updated;
  }

  async downloadDocument(id: string, res: Response, representativeId?: string) {
    const request = await this.prisma.proposalRequest.findUnique({ where: { id } });

    if (!request) throw new NotFoundException('Solicitação não encontrada');

    if (representativeId && request.representativeId !== representativeId) {
      throw new ForbiddenException('Proposta não pertence a você');
    }

    if (!request.documentUrl) {
      throw new BadRequestException('A proposta ainda não possui arquivo anexado.');
    }

    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .download(request.documentUrl.split('/').pop()!);

    if (error || !data) {
      throw new NotFoundException('Arquivo não encontrado no Storage');
    }

    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set({
      'Content-Type': data.type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${request.documentFileName}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  async delete(id: string) {
    return this.prisma.proposalRequest.delete({ where: { id } });
  }
}
