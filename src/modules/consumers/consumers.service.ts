import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateConsumerDto } from './dto/create-consumer.dto';
import { UpdateConsumerDto } from './dto/update-consumer.dto';
import { Prisma } from '@prisma/client';
import { ConsumerStatus, ConsumerApprovalStatus } from '../../common/enums';
import { AuditService } from '../../common/services/audit.service';
import { CommissionsService } from '../commissions/commissions.service';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { OcrService } from '../../common/services/ocr.service';
import { ConsumerChangeRequestsService } from './consumer-change-requests.service';

@Injectable()
export class ConsumersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private commissionsService: CommissionsService,
    private supabaseStorage: SupabaseStorageService,
    private ocrService: OcrService,
    private changeRequestsService: ConsumerChangeRequestsService,
  ) {}

  async create(createConsumerDto: CreateConsumerDto) {
    const { cpfCnpj, generatorId, birthDate, arrivalDate, ...consumerData } = createConsumerDto;

    // Se um gerador foi especificado, verifica se existe
    if (generatorId) {
      const generator = await this.prisma.generator.findUnique({
        where: { id: generatorId },
      });

      if (!generator) {
        throw new NotFoundException('Gerador não encontrado');
      }
    }

    const consumer = await this.prisma.consumer.create({
      data: {
        cpfCnpj,
        generatorId,
        birthDate: birthDate ? new Date(birthDate) : null,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        // Criado pelo painel interno: aprovado por padrão e sem submittedByRepresentativeId
        approvalStatus: ConsumerApprovalStatus.APPROVED,
        submittedByRepresentativeId: null,
        ...consumerData,
      },
      include: {
        generator: true,
      },
    });

    return consumer;
  }

  async createAsRepresentative(createConsumerDto: CreateConsumerDto, representativeId: string) {
    const { cpfCnpj, generatorId, birthDate, arrivalDate, ...consumerData } = createConsumerDto;

    // Verifica se o representante existe e está ativo
    const representative = await this.prisma.representative.findUnique({
      where: { id: representativeId },
    });

    if (!representative) {
      throw new NotFoundException('Representante não encontrado');
    }

    if (representative.status !== 'ACTIVE') {
      throw new BadRequestException('Representante não está ativo');
    }

    // Se um gerador foi especificado, verifica se existe
    if (generatorId) {
      const generator = await this.prisma.generator.findUnique({
        where: { id: generatorId },
      });

      if (!generator) {
        throw new NotFoundException('Gerador não encontrado');
      }
    }

    // Cria o consumidor vinculado ao representante em fila de aprovação
    const consumer = await this.prisma.consumer.create({
      data: {
        cpfCnpj,
        generatorId,
        birthDate: birthDate ? new Date(birthDate) : null,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        representativeId, // Vincula automaticamente ao representante
        approvalStatus: ConsumerApprovalStatus.PENDING,
        submittedByRepresentativeId: representativeId,
        ...consumerData,
      },
      include: {
        generator: true,
        Representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Registra a atividade de criação
    await this.auditService.logRepresentativeCreate(
      representativeId,
      'Consumer',
      consumer.id,
      {
        name: consumer.name,
        cpfCnpj: consumer.cpfCnpj,
        status: consumer.status,
        averageMonthlyConsumption: consumer.averageMonthlyConsumption,
        discountOffered: consumer.discountOffered,
      }
    );

    return {
      ...consumer,
      message: 'Cadastro enviado para aprovação. Você será notificado quando for aprovado ou se houver ajustes necessários.'
    } as any;
  }

  async findAll() {
    const consumers = await this.prisma.consumer.findMany({
      where: {
        // Mostrar aprovados ou quaisquer criados internamente (submittedByRepresentativeId = null)
        OR: [
          { approvalStatus: ConsumerApprovalStatus.APPROVED },
          { submittedByRepresentativeId: null },
        ],
      },
      include: {
        generator: {
          select: {
            id: true,
            ownerName: true,
            sourceType: true,
            installedPower: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Corrige URLs de faturas para usar endpoints do backend
    return consumers.map(consumer => {
      if (consumer.invoiceUrl && consumer.invoiceFileName) {
        return {
          ...consumer,
          invoiceUrl: `/consumers/${consumer.id}/invoice`,
        };
      }
      return consumer;
    });
  }

  async findOne(id: string) {
    const consumer = await this.prisma.consumer.findUnique({
      where: { id },
      include: {
        generator: true,
      },
    });

    if (!consumer) {
      throw new NotFoundException('Consumidor não encontrado');
    }

    // Se tiver fatura, substitui a URL do Supabase pela URL do endpoint do backend
    if (consumer.invoiceUrl && consumer.invoiceFileName) {
      // Retorna URL do endpoint do backend para evitar problemas com bucket não público
      return {
        ...consumer,
        invoiceUrl: `/consumers/${id}/invoice`, // URL do endpoint do backend para admins
      };
    }

    return consumer;
  }

  // Nova função para busca por cpfCnpj (caso necessário)
  async findByCpfCnpj(cpfCnpj: string) {
    const consumers = await this.prisma.consumer.findMany({
      where: { cpfCnpj },
      include: {
        generator: {
          select: {
            id: true,
            ownerName: true,
            sourceType: true,
            installedPower: true,
          },
        },
      },
    });

    return consumers;
  }

  async findByRepresentative(representativeId: string) {
    const consumers = await this.prisma.consumer.findMany({
      where: { representativeId },
      include: {
        generator: {
          select: {
            id: true,
            ownerName: true,
            sourceType: true,
            installedPower: true,
            status: true,
          },
        },
        Representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Corrige URLs de faturas para usar endpoints do backend
    return consumers.map(consumer => {
      if (consumer.invoiceUrl && consumer.invoiceFileName) {
        return {
          ...consumer,
          invoiceUrl: `/consumers/representative/${consumer.id}/invoice`,
        };
      }
      return consumer;
    });
  }

  async update(id: string, updateConsumerDto: UpdateConsumerDto) {
    const { generatorId, birthDate, arrivalDate, ...updateData } = updateConsumerDto;

    // Verifica se o consumidor existe
    await this.findOne(id);

    // Se um gerador foi especificado, verifica se existe
    if (generatorId) {
      const generator = await this.prisma.generator.findUnique({
        where: { id: generatorId },
      });

      if (!generator) {
        throw new NotFoundException('Gerador não encontrado');
      }
    }

    const consumer = await this.prisma.consumer.update({
      where: { id },
      data: {
        generatorId,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : undefined,
        ...updateData,
      },
      include: {
        generator: true,
      },
    });

    return consumer;
  }

  async remove(id: string) {
    // Verifica se o consumidor existe
    await this.findOne(id);

    await this.prisma.consumer.delete({
      where: { id },
    });

    return { message: 'Consumidor removido com sucesso' };
  }

  async allocateToGenerator(consumerId: string, generatorId: string, percentage: number) {
    // Só permitir alocação se aprovado
    const toAllocate = await this.findOne(consumerId);
    if ((toAllocate as any).approvalStatus !== ConsumerApprovalStatus.APPROVED) {
      throw new BadRequestException('Consumidor ainda não aprovado para alocação');
    }
    if (percentage <= 0 || percentage > 100) {
      throw new BadRequestException('Porcentagem deve estar entre 0 e 100');
    }

    // Verifica se o consumidor existe
    const consumer = await this.findOne(consumerId);

    // Verifica se o gerador existe
    const generator = await this.prisma.generator.findUnique({
      where: { id: generatorId },
    });

    if (!generator) {
      throw new NotFoundException('Gerador não encontrado');
    }

    // Verifica se o consumidor já está alocado
    if (consumer.status === ConsumerStatus.ALLOCATED) {
      throw new ConflictException('Consumidor já está alocado');
    }

    // Atualiza o consumidor
    const updatedConsumer = await this.prisma.consumer.update({
      where: { id: consumerId },
      data: {
        status: ConsumerStatus.ALLOCATED,
        generatorId,
        allocatedPercentage: percentage,
      },
      include: {
        generator: true,
      },
    });

    // Se o consumidor tem um representante vinculado e ainda não tem comissão, cria uma
    if (updatedConsumer.representativeId) {
      try {
        // Verifica se já existe comissão para este consumidor
        const existingCommission = await this.prisma.commission.findFirst({
          where: {
            consumerId: updatedConsumer.id,
            representativeId: updatedConsumer.representativeId,
          },
        });

        // Se não existe comissão, cria uma
        if (!existingCommission) {
          await this.commissionsService.createCommissionForApprovedConsumer(consumerId);
        }
      } catch (error) {
        // Log do erro mas não falha a alocação
        console.error('Erro ao criar comissão durante alocação:', error);
      }
    }

    return updatedConsumer;
  }

  async deallocate(consumerId: string) {
    // Só permitir se aprovado
    const toDeallocate = await this.findOne(consumerId);
    if ((toDeallocate as any).approvalStatus !== ConsumerApprovalStatus.APPROVED) {
      throw new BadRequestException('Consumidor ainda não aprovado');
    }
    // Verifica se o consumidor existe
    await this.findOne(consumerId);

    const updatedConsumer = await this.prisma.consumer.update({
      where: { id: consumerId },
      data: {
        status: ConsumerStatus.AVAILABLE,
        generatorId: null,
        allocatedPercentage: null,
      },
    });

    return updatedConsumer;
  }

  // Aprovação/rejeição por Admin/Operator
  async approveConsumer(consumerId: string, approverUserId?: string) {
    const existing = await this.findOne(consumerId);
    const approved = await this.prisma.consumer.update({
      where: { id: consumerId },
      data: {
        approvalStatus: (ConsumerApprovalStatus as any).APPROVED,
        approvedByUserId: approverUserId,
        approvedAt: new Date(),
      },
    });

    // Se o consumidor tem um representante vinculado, cria a comissão
    if (approved.representativeId) {
      try {
        await this.commissionsService.createCommissionForApprovedConsumer(consumerId);
      } catch (error) {
        // Log do erro mas não falha a aprovação
        console.error('Erro ao criar comissão:', error);
      }
    }

    await this.auditService.log({
      userId: approverUserId,
      action: 'APPROVE',
      entityType: 'Consumer',
      entityId: consumerId,
      oldValues: existing,
      newValues: approved,
    });

    return approved;
  }

  async rejectConsumer(consumerId: string, approverUserId: string, reason?: string) {
    const existing = await this.findOne(consumerId);
    const rejected = await this.prisma.consumer.update({
      where: { id: consumerId },
      data: {
        approvalStatus: (ConsumerApprovalStatus as any).REJECTED,
        approvedByUserId: approverUserId,
        approvedAt: new Date(),
        rejectionReason: reason || 'Sem motivo informado',
      },
    });

    await this.auditService.log({
      userId: approverUserId,
      action: 'REJECT',
      entityType: 'Consumer',
      entityId: consumerId,
      oldValues: existing,
      newValues: rejected,
    });

    return rejected;
  }

  async getByState(state: string) {
    const consumers = await this.prisma.consumer.findMany({
      where: {
        state,
        OR: [
          { approvalStatus: ConsumerApprovalStatus.APPROVED },
          { submittedByRepresentativeId: null },
        ],
      },
      include: {
        generator: {
          select: {
            id: true,
            ownerName: true,
            sourceType: true,
          },
        },
      },
    });

    return consumers;
  }

  async findPending(filters: {
    state?: string;
    city?: string;
    representativeId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { state, city, representativeId, startDate, endDate, page = 1, limit = 20 } = filters;

    const where: any = {
      approvalStatus: ConsumerApprovalStatus.PENDING,
      // Mostrar apenas os que vieram do painel do representante
      submittedByRepresentativeId: {
        not: null,
      },
    };

    if (representativeId) where.representativeId = representativeId;
    if (state) where.state = state;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [consumers, total] = await Promise.all([
      this.prisma.consumer.findMany({
        where,
        include: {
          Representative: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.consumer.count({ where }),
    ]);

    return {
      consumers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getStatistics() {
    const total = await this.prisma.consumer.count();
    const allocated = await this.prisma.consumer.count({
      where: { status: ConsumerStatus.ALLOCATED },
    });
    const available = await this.prisma.consumer.count({
      where: { status: ConsumerStatus.AVAILABLE },
    });

    const totalConsumption = await this.prisma.consumer.aggregate({
      _sum: {
        averageMonthlyConsumption: true,
      },
    });

    const byState = await this.prisma.consumer.groupBy({
      by: ['state'],
      _count: {
        id: true,
      },
    });

    return {
      total,
      allocated,
      available,
      allocationRate: total > 0 ? (allocated / total) * 100 : 0,
      totalMonthlyConsumption: totalConsumption._sum.averageMonthlyConsumption || 0,
      distributionByState: byState,
    };
  }

  // Métodos específicos para representantes
  async findRepresentativeConsumer(representativeId: string, consumerId: string) {
    const consumer = await this.prisma.consumer.findFirst({
      where: { 
        id: consumerId,
        representativeId 
      },
      include: {
        generator: {
          select: {
            id: true,
            ownerName: true,
            sourceType: true,
            installedPower: true,
            status: true,
            city: true,
            state: true,
            concessionaire: true,
          },
        },
        Representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!consumer) {
      throw new NotFoundException('Consumidor não encontrado ou não pertence ao representante');
    }

    // Se tiver fatura, substitui a URL do Supabase pela URL do endpoint do backend
    if (consumer.invoiceUrl && consumer.invoiceFileName) {
      return {
        ...consumer,
        invoiceUrl: `/consumers/representative/${consumerId}/invoice`, // URL do endpoint do backend
      };
    }

    return consumer;

    if (!consumer) {
      throw new NotFoundException('Consumidor não encontrado ou não pertence ao representante');
    }

    return consumer;
  }

  async findRepresentativeConsumersWithFilters(
    representativeId: string,
    filters: {
      status?: ConsumerStatus;
      approvalStatus?: ConsumerApprovalStatus;
      consumerType?: string;
      state?: string;
      city?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const {
      status,
      approvalStatus,
      consumerType,
      state,
      city,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = filters;

    const where: any = {
      representativeId,
    };

    if (status) {
      where.status = status;
    }

    if (approvalStatus) {
      where.approvalStatus = approvalStatus;
    }

    if (consumerType) {
      where.consumerType = consumerType;
    }

    if (state) {
      where.state = state;
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [consumers, total] = await Promise.all([
      this.prisma.consumer.findMany({
        where,
        include: {
          generator: {
            select: {
              id: true,
              ownerName: true,
              sourceType: true,
              installedPower: true,
              status: true,
              city: true,
              state: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.consumer.count({ where }),
    ]);

    // Calcula estatísticas dos consumidores retornados
    const stats = {
      totalConsumers: total,
      totalKwh: consumers.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0),
      allocatedKwh: consumers
        .filter(c => c.status === 'ALLOCATED' && c.allocatedPercentage)
        .reduce((sum, c) => sum + (c.averageMonthlyConsumption * (c.allocatedPercentage || 0) / 100), 0),
      pendingKwh: consumers
        .filter(c => c.status !== 'ALLOCATED')
        .reduce((sum, c) => sum + c.averageMonthlyConsumption, 0),
      statusBreakdown: {
        available: consumers.filter(c => c.status === 'AVAILABLE').length,
        allocated: consumers.filter(c => c.status === 'ALLOCATED').length,
        inProcess: consumers.filter(c => c.status === 'IN_PROCESS').length,
        converted: consumers.filter(c => c.status === 'CONVERTED').length,
      },
    };

    return {
      consumers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      stats,
    };
  }

  /**
   * Atualiza consumidor com lógica de aprovação:
   * - Campos críticos (kWh, desconto, UC, etc.) → Requer aprovação
   * - Campos não críticos (contato, endereço) → Atualização direta
   */
  async updateRepresentativeConsumerWithApproval(
    representativeId: string,
    consumerId: string,
    updateData: Partial<UpdateConsumerDto>
  ) {
    // Verifica se o consumidor pertence ao representante
    const existingConsumer = await this.prisma.consumer.findFirst({
      where: { 
        id: consumerId,
        representativeId 
      },
    });

    if (!existingConsumer) {
      throw new NotFoundException('Consumidor não encontrado ou não pertence ao representante');
    }

    // Define campos críticos que precisam aprovação
    const criticalFields = [
      'averageMonthlyConsumption',
      'discountOffered',
      'ucNumber',
      'concessionaire',
      'consumerType',
      'phase',
      'status',
      'allocatedPercentage',
      'generatorId',
    ];

    // Separa campos críticos e não críticos
    const criticalUpdates: any = {};
    const nonCriticalUpdates: any = {};
    const { birthDate, arrivalDate, ...restFields } = updateData;

    Object.keys(restFields).forEach((key) => {
      if (restFields[key] !== undefined && restFields[key] !== null) {
        if (criticalFields.includes(key)) {
          criticalUpdates[key] = restFields[key];
        } else {
          nonCriticalUpdates[key] = restFields[key];
        }
      }
    });

    // Adiciona datas se fornecidas
    if (birthDate) {
      nonCriticalUpdates.birthDate = new Date(birthDate);
    }
    if (arrivalDate) {
      nonCriticalUpdates.arrivalDate = new Date(arrivalDate);
    }

    let updatedConsumer = existingConsumer;
    let changeRequest: any = null;

    // 1. Atualiza campos não críticos diretamente (sem aprovação)
    if (Object.keys(nonCriticalUpdates).length > 0) {
      updatedConsumer = await this.prisma.consumer.update({
        where: { id: consumerId },
        data: nonCriticalUpdates,
        include: {
          generator: {
            select: {
              id: true,
              ownerName: true,
              sourceType: true,
              installedPower: true,
              status: true,
            },
          },
          Representative: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Log de auditoria para atualização direta
      await this.auditService.logRepresentativeUpdate(
        representativeId,
        'Consumer',
        consumerId,
        existingConsumer,
        nonCriticalUpdates,
      );
    }

    // 2. Cria solicitação de aprovação para campos críticos
    if (Object.keys(criticalUpdates).length > 0) {
      changeRequest = await this.changeRequestsService.createChangeRequest(
        consumerId,
        representativeId,
        criticalUpdates,
      );
    }

    return {
      consumer: updatedConsumer,
      changeRequest,
      message: Object.keys(nonCriticalUpdates).length > 0 && Object.keys(criticalUpdates).length > 0
        ? 'Campos não críticos atualizados. Campos críticos aguardam aprovação.'
        : Object.keys(criticalUpdates).length > 0
        ? 'Solicitação de alteração criada. Aguarde aprovação do administrador.'
        : 'Consumidor atualizado com sucesso.',
      updatedFields: {
        direct: Object.keys(nonCriticalUpdates),
        pending: Object.keys(criticalUpdates),
      },
    };
  }

  async updateRepresentativeConsumer(
    representativeId: string,
    consumerId: string,
    updateData: Partial<UpdateConsumerDto>
  ) {
    // Mantém método antigo para compatibilidade, mas redireciona para o novo
    return this.updateRepresentativeConsumerWithApproval(
      representativeId,
      consumerId,
      updateData,
    );
  }

  async getRepresentativeConsumerStats(representativeId: string) {
    const consumers = await this.prisma.consumer.findMany({
      where: { representativeId },
      select: {
        status: true,
        averageMonthlyConsumption: true,
        allocatedPercentage: true,
        consumerType: true,
        state: true,
        city: true,
        createdAt: true,
        discountOffered: true,
      },
    });

    if (consumers.length === 0) {
      return {
        totalConsumers: 0,
        totalKwh: 0,
        allocatedKwh: 0,
        pendingKwh: 0,
        allocationRate: 0,
        averageDiscount: 0,
        statusBreakdown: {
          available: 0,
          allocated: 0,
          inProcess: 0,
          converted: 0,
        },
        typeBreakdown: {},
        stateBreakdown: {},
        monthlyEvolution: [],
      };
    }

    const totalKwh = consumers.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0);
    const allocatedKwh = consumers
      .filter(c => c.status === 'ALLOCATED' && c.allocatedPercentage)
      .reduce((sum, c) => sum + (c.averageMonthlyConsumption * (c.allocatedPercentage || 0) / 100), 0);
    
    const averageDiscount = consumers.reduce((sum, c) => sum + c.discountOffered, 0) / consumers.length;

    // Agrupa por status
    const statusBreakdown = consumers.reduce((acc, c) => {
      acc[c.status.toLowerCase()] = (acc[c.status.toLowerCase()] || 0) + 1;
      return acc;
    }, {});

    // Agrupa por tipo de consumidor
    const typeBreakdown = consumers.reduce((acc, c) => {
      acc[c.consumerType] = (acc[c.consumerType] || 0) + 1;
      return acc;
    }, {});

    // Agrupa por estado
    const stateBreakdown = consumers.reduce((acc, c) => {
      acc[c.state] = (acc[c.state] || 0) + 1;
      return acc;
    }, {});

    // Evolução mensal dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEvolution: Array<{month: string, count: number, kwh: number}> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthConsumers = consumers.filter(c => {
        const consumerDate = new Date(c.createdAt);
        return consumerDate >= monthStart && consumerDate <= monthEnd;
      });

      monthlyEvolution.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        count: monthConsumers.length,
        kwh: monthConsumers.reduce((sum, c) => sum + c.averageMonthlyConsumption, 0),
      });
    }

    return {
      totalConsumers: consumers.length,
      totalKwh: Math.round(totalKwh * 100) / 100,
      allocatedKwh: Math.round(allocatedKwh * 100) / 100,
      pendingKwh: Math.round((totalKwh - allocatedKwh) * 100) / 100,
      allocationRate: totalKwh > 0 ? Math.round((allocatedKwh / totalKwh) * 100 * 100) / 100 : 0,
      averageDiscount: Math.round(averageDiscount * 100) / 100,
      statusBreakdown,
      typeBreakdown,
      stateBreakdown,
      monthlyEvolution,
    };
  }

  /**
   * Gera comissões para consumidores aprovados que ainda não têm comissão
   * Útil para consumidores cadastrados antes da implementação do sistema de comissões
   */
  async generateCommissionsForApprovedConsumers() {
    console.log('🔍 [DEBUG] Iniciando geração de comissões...');
    
    // Busca consumidores aprovados que têm representante, estão alocados a geradores mas não têm comissão
    const consumersWithoutCommission = await this.prisma.consumer.findMany({
      where: {
        approvalStatus: ConsumerApprovalStatus.APPROVED,
        representativeId: {
          not: null,
        },
        generatorId: {
          not: null, // Só gera comissão se estiver alocado a um gerador
        },
        commissions: {
          none: {},
        },
      },
      include: {
        Representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`🔍 [DEBUG] Consumidores encontrados: ${consumersWithoutCommission.length}`);
    console.log(`🔍 [DEBUG] Critérios: aprovados + representante + alocados a gerador + sem comissão`);
    
    // Log detalhado dos consumidores encontrados
    consumersWithoutCommission.forEach((consumer, index) => {
      console.log(`🔍 [DEBUG] Consumidor ${index + 1}:`, {
        id: consumer.id,
        name: consumer.name,
        representativeId: consumer.representativeId,
        representativeName: 'N/A',
        generatorId: consumer.generatorId,
        averageMonthlyConsumption: consumer.averageMonthlyConsumption,
        approvalStatus: consumer.approvalStatus
      });
    });

    const results: Array<{
      consumerId: string;
      consumerName: string;
      representativeId: string | null;
      representativeName: string | undefined;
      commissionValue?: number;
      status: 'SUCCESS' | 'ERROR';
      error?: string;
    }> = [];

    for (const consumer of consumersWithoutCommission) {
      try {
        const commission = await this.commissionsService.createCommissionForApprovedConsumer(consumer.id);
        results.push({
          consumerId: consumer.id,
          consumerName: consumer.name,
          representativeId: consumer.representativeId,
          representativeName: 'N/A',
          commissionValue: commission.commissionValue,
          status: 'SUCCESS',
        });
      } catch (error) {
        results.push({
          consumerId: consumer.id,
          consumerName: consumer.name,
          representativeId: consumer.representativeId,
          representativeName: 'N/A',
          status: 'ERROR',
          error: error.message,
        });
      }
    }

    console.log(`🔍 [DEBUG] Resultado final:`, {
      totalProcessed: consumersWithoutCommission.length,
      successful: results.filter(r => r.status === 'SUCCESS').length,
      errors: results.filter(r => r.status === 'ERROR').length,
    });

    return {
      totalProcessed: consumersWithoutCommission.length,
      successful: results.filter(r => r.status === 'SUCCESS').length,
      errors: results.filter(r => r.status === 'ERROR').length,
      results,
    };
  }

  /**
   * Gera comissões para consumidores aprovados que ainda não têm comissão (mesmo sem alocação)
   * Útil para casos especiais onde se quer gerar comissão independente da alocação
   */
  async generateCommissionsForApprovedConsumersWithoutAllocation() {
    console.log('🔍 [DEBUG] Iniciando geração de comissões (SEM alocação obrigatória)...');
    
    // Busca consumidores aprovados que têm representante mas não têm comissão (independente da alocação)
    const consumersWithoutCommission = await this.prisma.consumer.findMany({
      where: {
        approvalStatus: ConsumerApprovalStatus.APPROVED,
        representativeId: {
          not: null,
        },
        commissions: {
          none: {},
        },
      },
      include: {
        Representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`🔍 [DEBUG] Consumidores encontrados (sem alocação obrigatória): ${consumersWithoutCommission.length}`);
    console.log(`🔍 [DEBUG] Critérios: aprovados + representante + sem comissão (alocação opcional)`);
    
    // Log detalhado dos consumidores encontrados
    consumersWithoutCommission.forEach((consumer, index) => {
      console.log(`🔍 [DEBUG] Consumidor ${index + 1}:`, {
        id: consumer.id,
        name: consumer.name,
        representativeId: consumer.representativeId,
        representativeName: 'N/A',
        generatorId: consumer.generatorId,
        averageMonthlyConsumption: consumer.averageMonthlyConsumption,
        approvalStatus: consumer.approvalStatus
      });
    });

    const results: Array<{
      consumerId: string;
      consumerName: string;
      representativeId: string | null;
      representativeName: string | undefined;
      commissionValue?: number;
      status: 'SUCCESS' | 'ERROR';
      error?: string;
    }> = [];

    for (const consumer of consumersWithoutCommission) {
      try {
        const commission = await this.commissionsService.createCommissionForApprovedConsumer(consumer.id);
        results.push({
          consumerId: consumer.id,
          consumerName: consumer.name,
          representativeId: consumer.representativeId,
          representativeName: 'N/A',
          commissionValue: commission.commissionValue,
          status: 'SUCCESS',
        });
      } catch (error) {
        results.push({
          consumerId: consumer.id,
          consumerName: consumer.name,
          representativeId: consumer.representativeId,
          representativeName: 'N/A',
          status: 'ERROR',
          error: error.message,
        });
      }
    }

    console.log(`🔍 [DEBUG] Resultado final (sem alocação):`, {
      totalProcessed: consumersWithoutCommission.length,
      successful: results.filter(r => r.status === 'SUCCESS').length,
      errors: results.filter(r => r.status === 'ERROR').length,
    });

    return {
      totalProcessed: consumersWithoutCommission.length,
      successful: results.filter(r => r.status === 'SUCCESS').length,
      errors: results.filter(r => r.status === 'ERROR').length,
      results,
    };
  }

  /**
   * Debug: Verifica consumidores elegíveis para comissão
   */
  async debugEligibleConsumers() {
    console.log('🔍 [DEBUG] Iniciando análise de consumidores elegíveis...');
    
    // Total de consumidores
    const totalConsumers = await this.prisma.consumer.count();

    // Consumidores aprovados
    const approvedConsumers = await this.prisma.consumer.count({
      where: {
        approvalStatus: ConsumerApprovalStatus.APPROVED,
      },
    });

    console.log(`🔍 [DEBUG] Total de consumidores: ${totalConsumers}`);
    console.log(`🔍 [DEBUG] Consumidores aprovados: ${approvedConsumers}`);

    // Consumidores aprovados com representante
    const approvedWithRepresentative = await this.prisma.consumer.count({
      where: {
        approvalStatus: ConsumerApprovalStatus.APPROVED,
        representativeId: {
          not: null,
        },
      },
    });

    console.log(`🔍 [DEBUG] Consumidores aprovados com representante: ${approvedWithRepresentative}`);

    // Consumidores aprovados com representante e alocados
    const approvedWithRepresentativeAndAllocated = await this.prisma.consumer.count({
      where: {
        approvalStatus: ConsumerApprovalStatus.APPROVED,
        representativeId: {
          not: null,
        },
        generatorId: {
          not: null,
        },
      },
    });

    console.log(`🔍 [DEBUG] Consumidores aprovados com representante E alocados: ${approvedWithRepresentativeAndAllocated}`);

    // Consumidores aprovados com representante, alocados e sem comissão
    const eligibleForCommission = await this.prisma.consumer.findMany({
      where: {
        approvalStatus: ConsumerApprovalStatus.APPROVED,
        representativeId: {
          not: null,
        },
        generatorId: {
          not: null,
        },
        commissions: {
          none: {},
        },
      },
      include: {
        Representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        generator: {
          select: {
            id: true,
            ownerName: true,
          },
        },
      },
    });

    // Consumidores que já têm comissão
    const withCommission = await this.prisma.consumer.count({
      where: {
        approvalStatus: ConsumerApprovalStatus.APPROVED,
        representativeId: {
          not: null,
        },
        generatorId: {
          not: null,
        },
        commissions: {
          some: {},
        },
      },
    });

    return {
      summary: {
        totalConsumers,
        approvedConsumers,
        approvedWithRepresentative,
        approvedWithRepresentativeAndAllocated,
        withCommission,
        eligibleForCommission: eligibleForCommission.length,
      },
      eligibleConsumers: eligibleForCommission.map(consumer => ({
        id: consumer.id,
        name: consumer.name,
        cpfCnpj: consumer.cpfCnpj,
        averageMonthlyConsumption: consumer.averageMonthlyConsumption,
        representative: consumer.Representative,
        generator: consumer.generator,
        status: consumer.status,
        approvalStatus: consumer.approvalStatus,
        approvedAt: consumer.approvedAt,
      })),
    };
  }

  async getConsumerActivityHistory(representativeId: string, consumerId: string) {
    // Verifica se o consumidor pertence ao representante
    const consumer = await this.prisma.consumer.findFirst({
      where: { 
        id: consumerId,
        representativeId 
      },
    });

    if (!consumer) {
      throw new NotFoundException('Consumidor não encontrado ou não pertence ao representante');
    }

    // Busca logs de auditoria relacionados ao consumidor
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        entityType: 'Consumer',
        entityId: consumerId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formata os logs para uma apresentação mais amigável
    const formattedLogs = auditLogs.map(log => {
      let description = '';
      let icon = '';
      let color = '';

      switch (log.action) {
        case 'CREATE':
          description = 'Consumidor foi cadastrado';
          icon = 'user-plus';
          color = 'green';
          break;
        case 'UPDATE':
          description = 'Dados do consumidor foram atualizados';
          icon = 'edit';
          color = 'blue';
          break;
        case 'STATUS_CHANGE':
          description = 'Status do consumidor foi alterado';
          icon = 'refresh';
          color = 'orange';
          break;
        case 'ALLOCATE':
          description = 'Consumidor foi alocado a um gerador';
          icon = 'link';
          color = 'purple';
          break;
        case 'DEALLOCATE':
          description = 'Consumidor foi desalocado do gerador';
          icon = 'unlink';
          color = 'red';
          break;
        default:
          description = `Ação: ${log.action}`;
          icon = 'activity';
          color = 'gray';
      }

      // Adiciona detalhes específicos se disponível
      if (log.newValues) {
        const newValues = log.newValues as any;
        if (newValues.status) {
          description += ` para "${newValues.status}"`;
        }
        if (newValues.name && log.action === 'CREATE') {
          description += ` - ${newValues.name}`;
        }
      }

      return {
        id: log.id,
        action: log.action,
        description,
        icon,
        color,
        timestamp: log.createdAt,
        user: log.user ? {
          id: log.user.id,
          name: log.user.name,
          email: log.user.email,
          role: log.user.role,
        } : null,
        oldValues: log.oldValues,
        newValues: log.newValues,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
      };
    });

    return {
      consumer: {
        id: consumer.id,
        name: consumer.name,
        cpfCnpj: consumer.cpfCnpj,
        status: consumer.status,
      },
      activities: formattedLogs,
      totalActivities: formattedLogs.length,
    };
  }

  /**
   * Debug: Cria um consumidor de teste para verificar o sistema de comissões
   */
  async createTestConsumer() {
    console.log('🔍 [DEBUG] Criando consumidor de teste...');
    
    // Busca o primeiro representante disponível
    const representative = await this.prisma.representative.findFirst({
      where: {
        status: 'ACTIVE',
      },
    });

    if (!representative) {
      throw new Error('Nenhum representante ativo encontrado');
    }

    console.log(`🔍 [DEBUG] Usando representante: ${representative.name} (${representative.id})`);

    // Cria um consumidor de teste
    const testConsumer = await this.prisma.consumer.create({
      data: {
        name: 'Consumidor Teste Comissão',
        cpfCnpj: '123.456.789-00',
        email: 'teste@comissao.com',
        phone: '11999999999',
        street: 'Rua Teste',
        number: '123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        averageMonthlyConsumption: 500, // 500 kWh
        consumerType: 'RESIDENTIAL',
        status: 'AVAILABLE',
        approvalStatus: 'APPROVED',
        representativeId: representative.id,
        // Campos obrigatórios
        concessionaire: 'CPFL',
        ucNumber: '123456789',
        phase: 'MONOPHASIC',
        discountOffered: 0,
        // Não aloca a gerador para testar o endpoint flexível
        generatorId: null,
      },
      include: {
        Representative: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`🔍 [DEBUG] Consumidor de teste criado:`, {
      id: testConsumer.id,
      name: testConsumer.name,
      representativeId: testConsumer.representativeId,
      averageMonthlyConsumption: testConsumer.averageMonthlyConsumption,
      approvalStatus: testConsumer.approvalStatus,
      generatorId: testConsumer.generatorId,
    });

    return {
      message: 'Consumidor de teste criado com sucesso',
      consumer: testConsumer,
    };
  }

  /**
   * Gera comissão para um consumidor específico
   */
  async generateCommissionForConsumer(consumerId: string) {
    console.log(`🔍 [DEBUG] Gerando comissão para consumidor específico: ${consumerId}`);
    
    try {
      // Busca o consumidor
      const consumer = await this.prisma.consumer.findUnique({
        where: { id: consumerId },
        include: {
          Representative: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!consumer) {
        throw new Error('Consumidor não encontrado');
      }

      console.log(`🔍 [DEBUG] Consumidor encontrado:`, {
        id: consumer.id,
        name: consumer.name,
        representativeId: consumer.representativeId,
        representativeName: 'N/A',
        approvalStatus: consumer.approvalStatus,
        averageMonthlyConsumption: consumer.averageMonthlyConsumption,
        generatorId: consumer.generatorId,
      });

      // Verifica se já tem comissão
      const existingCommission = await this.prisma.commission.findFirst({
        where: {
          consumerId: consumer.id,
          representativeId: consumer.representativeId || undefined,
        },
      });

      if (existingCommission) {
        console.log(`🔍 [DEBUG] Consumidor já tem comissão: ${existingCommission.id}`);
        return {
          totalProcessed: 0,
          successful: 0,
          errors: 1,
          results: [{
            consumerId: consumer.id,
            consumerName: consumer.name,
            representativeId: consumer.representativeId,
            representativeName: 'N/A',
            commissionValue: existingCommission.commissionValue,
            status: 'ERROR',
            error: 'Comissão já existe para este consumidor',
          }],
        };
      }

      // Gera a comissão usando o CommissionsService
      const commission = await this.commissionsService.createCommissionForApprovedConsumer(consumerId);

      console.log(`🔍 [DEBUG] Comissão gerada com sucesso:`, {
        id: commission.id,
        value: commission.commissionValue,
        consumerId: commission.consumerId,
        representativeId: commission.representativeId,
      });

      return {
        totalProcessed: 1,
        successful: 1,
        errors: 0,
        results: [{
          consumerId: consumer.id,
          consumerName: consumer.name,
          representativeId: consumer.representativeId,
          representativeName: 'N/A',
          commissionValue: commission.commissionValue,
          status: 'SUCCESS',
        }],
      };

    } catch (error) {
      console.error(`🔍 [DEBUG] Erro ao gerar comissão:`, error.message);
      
      return {
        totalProcessed: 1,
        successful: 0,
        errors: 1,
        results: [{
          consumerId: consumerId,
          consumerName: 'N/A',
          representativeId: null,
          representativeName: 'N/A',
          commissionValue: 0,
          status: 'ERROR',
          error: error.message,
        }],
      };
    }
  }

  /**
   * Faz upload de fatura para um consumidor
   */
  async uploadInvoice(
    consumerId: string,
    representativeId: string,
    file: Express.Multer.File,
  ) {
    // Verifica se o consumidor existe e pertence ao representante
    const consumer = await this.prisma.consumer.findUnique({
      where: { id: consumerId },
    });

    if (!consumer) {
      throw new NotFoundException('Consumidor não encontrado');
    }

    if (consumer.representativeId !== representativeId) {
      throw new ForbiddenException(
        'Você só pode fazer upload de faturas para consumidores que você criou',
      );
    }

    // Gera nome amigável para o arquivo
    const fileExtension = file.originalname.split('.').pop();
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const consumerName = consumer.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9]/g, '-') // Remove caracteres especiais
      .toLowerCase()
      .substring(0, 30); // Limita tamanho
    
    // Nome amigável para exibição: "Nome-Consumidor-2025-12-27.pdf"
    const friendlyFileName = `${consumerName}-${timestamp}.${fileExtension}`;
    
    // Nome interno único para storage (mantém ID para evitar conflitos)
    const storageFileName = `fatura-${consumerId}-${Date.now()}.${fileExtension}`;
    const folder = `consumers/${consumerId}`;

    // Faz upload para o Supabase Storage
    const { url, path } = await this.supabaseStorage.uploadFile(
      file,
      storageFileName,
      folder,
    );

    // Remove fatura anterior se existir (em background para não bloquear)
    if (consumer.invoiceUrl) {
      this.supabaseStorage.deleteFile(consumer.invoiceFileName || '').catch((error) => {
        console.error('Erro ao remover fatura anterior:', error);
      });
    }

    // Atualiza o consumidor com a nova fatura (sem OCR ainda)
    const updatedConsumer = await this.prisma.consumer.update({
      where: { id: consumerId },
      data: {
        invoiceUrl: url,
        invoiceFileName: path,
        invoiceUploadedAt: new Date(),
        invoiceScannedData: {
          friendlyFileName: friendlyFileName, // Nome amigável para exibição
          processing: true, // Indica que OCR está em processamento
        } as any,
      },
    });

    // Processa OCR em background (não bloqueia a resposta)
    let scannedData: any = null;
    if (file.mimetype.startsWith('image/')) {
      // Processa OCR de forma assíncrona sem bloquear a resposta
      this.processOcrAsync(consumerId, file.buffer, friendlyFileName).catch((error) => {
        console.error('Erro ao processar OCR em background:', error);
      });
    } else {
      // Para PDFs, já atualiza sem OCR
      await this.prisma.consumer.update({
        where: { id: consumerId },
        data: {
          invoiceScannedData: {
            friendlyFileName: friendlyFileName,
            processing: false,
          } as any,
        },
      });
    }

    // Log de auditoria (em background para não bloquear)
    this.auditService.log({
      representativeId: representativeId,
      action: 'UPLOAD_INVOICE',
      entityType: 'Consumer',
      entityId: consumerId,
      metadata: {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        isImage: file.mimetype.startsWith('image/'),
      },
    }).catch((error) => {
      console.error('Erro ao registrar log de auditoria:', error);
    });

    // Retorna URL do endpoint do backend ao invés da URL pública do Supabase
    // Isso evita problemas com buckets não públicos
    const backendUrl = `/consumers/representative/${consumerId}/invoice`;

    return {
      consumer: updatedConsumer,
      invoiceUrl: backendUrl, // URL do endpoint do backend
      invoiceStorageUrl: url, // URL original do Supabase (para referência)
      invoiceFileName: friendlyFileName, // Nome amigável para exibição
      scannedData: file.mimetype.startsWith('image/') 
        ? { processing: true } // Indica que OCR está sendo processado
        : null,
    };
  }

  /**
   * Processa OCR de forma assíncrona em background
   */
  private async processOcrAsync(
    consumerId: string,
    imageBuffer: Buffer,
    friendlyFileName: string,
  ): Promise<void> {
    try {
      const ocrResult = await this.ocrService.extractTextFromImage(imageBuffer);
      
      const scannedData = {
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        extractedData: ocrResult.data,
        friendlyFileName: friendlyFileName,
        processing: false,
        processedAt: new Date().toISOString(),
      };

      // Atualiza o consumidor com os dados do OCR
      await this.prisma.consumer.update({
        where: { id: consumerId },
        data: {
          invoiceScannedData: scannedData as any,
        },
      });

      console.log(`OCR processado com sucesso para consumidor ${consumerId}`);
    } catch (error) {
      console.error(`Erro ao processar OCR para consumidor ${consumerId}:`, error);
      
      // Atualiza indicando que houve erro no processamento
      await this.prisma.consumer.update({
        where: { id: consumerId },
        data: {
          invoiceScannedData: {
            friendlyFileName: friendlyFileName,
            processing: false,
            error: 'Erro ao processar OCR',
          } as any,
        },
      });
    }
  }

  /**
   * Remove fatura de um consumidor
   */
  async removeInvoice(consumerId: string, representativeId: string) {
    // Verifica se o consumidor existe e pertence ao representante
    const consumer = await this.prisma.consumer.findUnique({
      where: { id: consumerId },
    });

    if (!consumer) {
      throw new NotFoundException('Consumidor não encontrado');
    }

    if (consumer.representativeId !== representativeId) {
      throw new ForbiddenException(
        'Você só pode remover faturas de consumidores que você criou',
      );
    }

    if (!consumer.invoiceUrl) {
      throw new BadRequestException('Este consumidor não possui fatura anexada');
    }

    // Remove do Supabase Storage
    if (consumer.invoiceFileName) {
      try {
        await this.supabaseStorage.deleteFile(consumer.invoiceFileName);
      } catch (error) {
        console.error('Erro ao remover arquivo do storage:', error);
      }
    }

    // Atualiza o consumidor
    const updatedConsumer = await this.prisma.consumer.update({
      where: { id: consumerId },
      data: {
        invoiceUrl: null,
        invoiceFileName: null,
        invoiceUploadedAt: null,
        invoiceScannedData: Prisma.DbNull,
      },
    });

    // Log de auditoria
    await this.auditService.log({
      representativeId: representativeId,
      action: 'REMOVE_INVOICE',
      entityType: 'Consumer',
      entityId: consumerId,
    });

    return updatedConsumer;
  }

  /**
   * Faz download de fatura (Representante)
   */
  async downloadInvoice(
    consumerId: string,
    representativeId: string,
    res: any,
  ) {
    // Verifica se o consumidor existe e pertence ao representante
    const consumer = await this.prisma.consumer.findUnique({
      where: { id: consumerId },
    });

    if (!consumer) {
      throw new NotFoundException('Consumidor não encontrado');
    }

    if (consumer.representativeId !== representativeId) {
      throw new ForbiddenException(
        'Você só pode fazer download de faturas de consumidores que você criou',
      );
    }

    if (!consumer.invoiceFileName) {
      throw new NotFoundException('Este consumidor não possui fatura anexada');
    }

    // Faz download do arquivo do Supabase
    const fileBuffer = await this.supabaseStorage.downloadFile(
      consumer.invoiceFileName,
    );

    // Determina o content-type baseado na extensão
    const extension = consumer.invoiceFileName.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    const contentType = contentTypeMap[extension || ''] || 'application/octet-stream';

    // Gera nome amigável para download
    const friendlyName = this.getFriendlyInvoiceName(consumer);

    // Define headers e envia o arquivo
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${friendlyName}"`,
    );
    res.send(fileBuffer);
  }

  /**
   * Faz download de fatura (Admin)
   */
  async downloadInvoiceAdmin(consumerId: string, res: any) {
    try {
      // Verifica se o consumidor existe
      const consumer = await this.prisma.consumer.findUnique({
        where: { id: consumerId },
      });

      if (!consumer) {
        throw new NotFoundException('Consumidor não encontrado');
      }

      if (!consumer.invoiceFileName) {
        throw new NotFoundException('Este consumidor não possui fatura anexada');
      }

      console.log(`[downloadInvoiceAdmin] Tentando fazer download do arquivo: ${consumer.invoiceFileName}`);

      // Faz download do arquivo do Supabase
      const fileBuffer = await this.supabaseStorage.downloadFile(
        consumer.invoiceFileName,
      );

      // Determina o content-type baseado na extensão
      const extension = consumer.invoiceFileName.split('.').pop()?.toLowerCase();
      const contentTypeMap: Record<string, string> = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
      };
      const contentType = contentTypeMap[extension || ''] || 'application/octet-stream';

      // Gera nome amigável para download
      const friendlyName = this.getFriendlyInvoiceName(consumer);
      
      // Define headers e envia o arquivo
      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${friendlyName}"`,
      );
      res.send(fileBuffer);
    } catch (error: any) {
      // Se o erro for relacionado ao bucket, fornece mensagem mais clara
      if (error.message?.includes('Bucket') || error.message?.includes('bucket')) {
        throw new NotFoundException(
          `Erro ao acessar a fatura: ${error.message}. Verifique se o bucket 'faturas-representantes' está configurado corretamente no Supabase.`
        );
      }
      // Re-lança outros erros
      throw error;
    }
  }

  /**
   * Gera nome amigável para a fatura
   */
  private getFriendlyInvoiceName(consumer: any): string {
    // Tenta pegar do scannedData primeiro
    if (consumer.invoiceScannedData?.friendlyFileName) {
      return consumer.invoiceScannedData.friendlyFileName;
    }

    // Se não tiver, gera baseado no nome do consumidor e data
    const extension = consumer.invoiceFileName?.split('.').pop() || 'pdf';
    const consumerName = consumer.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9]/g, '-') // Remove caracteres especiais
      .toLowerCase()
      .substring(0, 30);
    
    const date = consumer.invoiceUploadedAt
      ? new Date(consumer.invoiceUploadedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    return `Fatura-${consumerName}-${date}.${extension}`;
  }

}
