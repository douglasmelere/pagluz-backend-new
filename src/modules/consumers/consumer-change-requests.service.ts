import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { ChangeRequestStatus } from '../../common/enums';
import { AuditService } from '../../common/services/audit.service';

@Injectable()
export class ConsumerChangeRequestsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Cria uma solicitação de mudança para um consumidor
   */
  async createChangeRequest(
    consumerId: string,
    representativeId: string,
    newValues: any,
    userId?: string,
  ) {
    // Verifica se o consumidor existe e pertence ao representante
    const consumer = await this.prisma.consumer.findUnique({
      where: { id: consumerId },
      include: { Representative: true },
    });

    if (!consumer) {
      throw new NotFoundException('Consumidor não encontrado');
    }

    if (consumer.representativeId !== representativeId) {
      throw new ForbiddenException(
        'Você só pode editar consumidores que você criou',
      );
    }

    // Identifica campos alterados
    const changedFields = Object.keys(newValues).filter(
      (key) => consumer[key] !== newValues[key],
    );

    if (changedFields.length === 0) {
      throw new BadRequestException('Nenhuma alteração foi detectada');
    }

    // Cria a solicitação de mudança
    const changeRequest = await this.prisma.consumerChangeRequest.create({
      data: {
        consumerId,
        representativeId,
        oldValues: this.extractOldValues(consumer, changedFields),
        newValues,
        changedFields,
        status: ChangeRequestStatus.PENDING,
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
          },
        },
        representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log de auditoria
    if (userId) {
      await this.auditService.log({
        userId,
        action: 'CREATE_CHANGE_REQUEST',
        entityType: 'ConsumerChangeRequest',
        entityId: changeRequest.id,
        newValues: {
          consumerId,
          changedFields,
        },
      });
    }

    return changeRequest;
  }

  /**
   * Aprova uma solicitação de mudança
   */
  async approveChangeRequest(
    changeRequestId: string,
    adminUserId: string,
    rejectionReason?: string,
  ) {
    const changeRequest = await this.prisma.consumerChangeRequest.findUnique({
      where: { id: changeRequestId },
      include: { consumer: true },
    });

    if (!changeRequest) {
      throw new NotFoundException('Solicitação de mudança não encontrada');
    }

    if (changeRequest.status !== ChangeRequestStatus.PENDING) {
      throw new BadRequestException(
        'Esta solicitação já foi processada',
      );
    }

    // Atualiza o consumidor com os novos valores
    const updatedConsumer = await this.prisma.consumer.update({
      where: { id: changeRequest.consumerId },
      data: changeRequest.newValues as any,
    });

    // Atualiza a solicitação como aprovada
    await this.prisma.consumerChangeRequest.update({
      where: { id: changeRequestId },
      data: {
        status: ChangeRequestStatus.APPROVED,
        reviewedByUserId: adminUserId,
        reviewedAt: new Date(),
      },
    });

    // Log de auditoria
    await this.auditService.log({
      userId: adminUserId,
      action: 'APPROVE_CHANGE_REQUEST',
      entityType: 'Consumer',
      entityId: changeRequest.consumerId,
      oldValues: changeRequest.oldValues,
      newValues: changeRequest.newValues,
    });

    return {
      changeRequest,
      consumer: updatedConsumer,
    };
  }

  /**
   * Rejeita uma solicitação de mudança
   */
  async rejectChangeRequest(
    changeRequestId: string,
    adminUserId: string,
    rejectionReason: string,
  ) {
    const changeRequest = await this.prisma.consumerChangeRequest.findUnique({
      where: { id: changeRequestId },
    });

    if (!changeRequest) {
      throw new NotFoundException('Solicitação de mudança não encontrada');
    }

    if (changeRequest.status !== ChangeRequestStatus.PENDING) {
      throw new BadRequestException(
        'Esta solicitação já foi processada',
      );
    }

    // Atualiza a solicitação como rejeitada
    const updated = await this.prisma.consumerChangeRequest.update({
      where: { id: changeRequestId },
      data: {
        status: ChangeRequestStatus.REJECTED,
        reviewedByUserId: adminUserId,
        reviewedAt: new Date(),
        rejectionReason,
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
          },
        },
        representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log de auditoria
    await this.auditService.log({
      userId: adminUserId,
      action: 'REJECT_CHANGE_REQUEST',
      entityType: 'ConsumerChangeRequest',
      entityId: changeRequestId,
      metadata: {
        rejectionReason,
        consumerId: changeRequest.consumerId,
      },
    });

    return updated;
  }

  /**
   * Lista todas as solicitações pendentes
   */
  async getPendingRequests(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.prisma.consumerChangeRequest.findMany({
        where: {
          status: ChangeRequestStatus.PENDING,
        },
        include: {
          consumer: {
            select: {
              id: true,
              name: true,
              cpfCnpj: true,
              ucNumber: true,
            },
          },
          representative: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          requestedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.consumerChangeRequest.count({
        where: {
          status: ChangeRequestStatus.PENDING,
        },
      }),
    ]);

    return {
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lista solicitações de um representante
   */
  async getRepresentativeRequests(representativeId: string) {
    return this.prisma.consumerChangeRequest.findMany({
      where: {
        representativeId,
      },
      include: {
        consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });
  }

  /**
   * Extrai valores antigos do consumidor
   */
  private extractOldValues(consumer: any, fields: string[]): any {
    const oldValues: any = {};
    fields.forEach((field) => {
      oldValues[field] = consumer[field];
    });
    return oldValues;
  }
}

