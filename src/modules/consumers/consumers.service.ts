import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateConsumerDto } from './dto/create-consumer.dto';
import { UpdateConsumerDto } from './dto/update-consumer.dto';
import { ConsumerStatus } from '@prisma/client';

@Injectable()
export class ConsumersService {
  constructor(private prisma: PrismaService) {}

  async create(createConsumerDto: CreateConsumerDto) {
    const { cpfCnpj, generatorId, ...consumerData } = createConsumerDto;

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
        ...consumerData,
      },
      include: {
        generator: true,
      },
    });

    return consumer;
  }

  async createAsRepresentative(createConsumerDto: CreateConsumerDto, representativeId: string) {
    const { cpfCnpj, generatorId, ...consumerData } = createConsumerDto;

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

    // Cria o consumidor vinculado ao representante
    const consumer = await this.prisma.consumer.create({
      data: {
        cpfCnpj,
        generatorId,
        representativeId, // Vincula automaticamente ao representante
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

    return consumer;
  }

  async findAll() {
    const consumers = await this.prisma.consumer.findMany({
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

    return consumers;
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

    return consumers;
  }

  async update(id: string, updateConsumerDto: UpdateConsumerDto) {
    const { generatorId, ...updateData } = updateConsumerDto;

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

    return updatedConsumer;
  }

  async deallocate(consumerId: string) {
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

  async getByState(state: string) {
    const consumers = await this.prisma.consumer.findMany({
      where: { state },
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
}
