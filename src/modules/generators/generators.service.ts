import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateGeneratorDto } from './dto/create-generator.dto';
import { UpdateGeneratorDto } from './dto/update-generator.dto';
import { GeneratorStatus } from '@prisma/client';

@Injectable()
export class GeneratorsService {
  constructor(private prisma: PrismaService) {}

  async create(createGeneratorDto: CreateGeneratorDto) {
    const { cpfCnpj, ...generatorData } = createGeneratorDto;

    const generator = await this.prisma.generator.create({
      data: {
        cpfCnpj,
        ...generatorData,
      },
      include: {
        consumers: true,
      },
    });

    return this.calculateAllocationPercentages(generator);
  }

  async findAll() {
    const generators = await this.prisma.generator.findMany({
      include: {
        consumers: {
          select: {
            id: true,
            name: true,
            allocatedPercentage: true,
            averageMonthlyConsumption: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return generators.map(generator => this.calculateAllocationPercentages(generator));
  }

  async findOne(id: string) {
    const generator = await this.prisma.generator.findUnique({
      where: { id },
      include: {
        consumers: true,
      },
    });

    if (!generator) {
      throw new NotFoundException('Gerador não encontrado');
    }

    return this.calculateAllocationPercentages(generator);
  }

  async update(id: string, updateGeneratorDto: UpdateGeneratorDto) {
    // Verifica se o gerador existe
    await this.findOne(id);

    const generator = await this.prisma.generator.update({
      where: { id },
      data: updateGeneratorDto,
      include: {
        consumers: true,
      },
    });

    return this.calculateAllocationPercentages(generator);
  }

  async remove(id: string) {
    // Verifica se o gerador existe
    const generator = await this.findOne(id);

    // Verifica se há consumidores alocados
    if (generator.consumers && generator.consumers.length > 0) {
      throw new ConflictException(
        'Não é possível remover um gerador que possui consumidores alocados',
      );
    }

    await this.prisma.generator.delete({
      where: { id },
    });

    return { message: 'Gerador removido com sucesso' };
  }

  async getByState(state: string) {
    const generators = await this.prisma.generator.findMany({
      where: { state },
      include: {
        consumers: {
          select: {
            id: true,
            name: true,
            allocatedPercentage: true,
          },
        },
      },
    });

    return generators.map(generator => this.calculateAllocationPercentages(generator));
  }

  async getBySourceType(sourceType: string) {
    const generators = await this.prisma.generator.findMany({
      where: { sourceType: sourceType as any },
      include: {
        consumers: {
          select: {
            id: true,
            name: true,
            allocatedPercentage: true,
          },
        },
      },
    });

    return generators.map(generator => this.calculateAllocationPercentages(generator));
  }

  async getStatistics() {
    const total = await this.prisma.generator.count();
    
    const underAnalysis = await this.prisma.generator.count({
      where: { status: GeneratorStatus.UNDER_ANALYSIS },
    });
    
    const awaitingAllocation = await this.prisma.generator.count({
      where: { status: GeneratorStatus.AWAITING_ALLOCATION },
    });

    const totalInstalledPower = await this.prisma.generator.aggregate({
      _sum: {
        installedPower: true,
      },
    });

    const byState = await this.prisma.generator.groupBy({
      by: ['state'],
      _count: {
        id: true,
      },
      _sum: {
        installedPower: true,
      },
    });

    const bySourceType = await this.prisma.generator.groupBy({
      by: ['sourceType'],
      _count: {
        id: true,
      },
      _sum: {
        installedPower: true,
      },
    });

    // Calcula a capacidade total alocada
    const allocatedConsumers = await this.prisma.consumer.findMany({
      where: {
        generatorId: { not: null },
        allocatedPercentage: { not: null },
      },
      include: {
        generator: true,
      },
    });

    let totalAllocatedCapacity = 0;
    allocatedConsumers.forEach(consumer => {
      if (consumer.generator && consumer.allocatedPercentage) {
        totalAllocatedCapacity += (consumer.generator.installedPower * consumer.allocatedPercentage) / 100;
      }
    });

    const totalCapacity = totalInstalledPower._sum.installedPower || 0;
    const allocationRate = totalCapacity > 0 ? (totalAllocatedCapacity / totalCapacity) * 100 : 0;

    return {
      total,
      underAnalysis,
      awaitingAllocation,
      totalInstalledPower: totalCapacity,
      totalAllocatedCapacity,
      availableCapacity: totalCapacity - totalAllocatedCapacity,
      allocationRate,
      distributionByState: byState,
      distributionBySourceType: bySourceType,
    };
  }

  private calculateAllocationPercentages(generator: any) {
    if (!generator.consumers || generator.consumers.length === 0) {
      return {
        ...generator,
        allocatedPercentage: 0,
        availablePercentage: 100,
        allocatedCapacity: 0,
        availableCapacity: generator.installedPower,
      };
    }

    const totalAllocatedPercentage = generator.consumers.reduce(
      (sum: number, consumer: any) => sum + (consumer.allocatedPercentage || 0),
      0,
    );

    const allocatedCapacity = (generator.installedPower * totalAllocatedPercentage) / 100;
    const availableCapacity = generator.installedPower - allocatedCapacity;

    return {
      ...generator,
      allocatedPercentage: Math.min(totalAllocatedPercentage, 100),
      availablePercentage: Math.max(100 - totalAllocatedPercentage, 0),
      allocatedCapacity,
      availableCapacity: Math.max(availableCapacity, 0),
    };
  }
}
