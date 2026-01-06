import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';
import { Prisma } from '@prisma/client';
import { RepresentativeStatus } from '../../common/enums';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RepresentativesService {
  constructor(private prisma: PrismaService) {}

  async create(createRepresentativeDto: CreateRepresentativeDto) {
    // Verifica se já existe representante com o mesmo email ou CPF/CNPJ
    const existingEmail = await this.prisma.representative.findUnique({
      where: { email: createRepresentativeDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Já existe um representante com este e-mail');
    }

    const existingCpfCnpj = await this.prisma.representative.findUnique({
      where: { cpfCnpj: createRepresentativeDto.cpfCnpj },
    });

    if (existingCpfCnpj) {
      throw new ConflictException('Já existe um representante com este CPF/CNPJ');
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(createRepresentativeDto.password, 10);

    return this.prisma.representative.create({
      data: {
        ...createRepresentativeDto,
        password: hashedPassword,
        specializations: createRepresentativeDto.specializations || [],
        status: createRepresentativeDto.status || 'PENDING_APPROVAL',
      },
      select: {
        id: true,
        name: true,
        cpfCnpj: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        specializations: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        loginCount: true,
      },
    });
  }

  async findAll() {
    return this.prisma.representative.findMany({
      select: {
        id: true,
        name: true,
        cpfCnpj: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        specializations: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        loginCount: true,
        _count: {
          select: {
            Consumer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const representative = await this.prisma.representative.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        cpfCnpj: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        specializations: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        loginCount: true,
        Consumer: {
          select: {
            id: true,
            name: true,
            cpfCnpj: true,
            status: true,
            averageMonthlyConsumption: true,
            allocatedPercentage: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            Consumer: true,
          },
        },
      },
    });

    if (!representative) {
      throw new NotFoundException('Representante não encontrado');
    }

    return representative;
  }

  async findByEmail(email: string) {
    return this.prisma.representative.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateRepresentativeDto: UpdateRepresentativeDto) {
    // Verifica se o representante existe
    const existingRepresentative = await this.prisma.representative.findUnique({
      where: { id },
    });

    if (!existingRepresentative) {
      throw new NotFoundException('Representante não encontrado');
    }

    // Se estiver atualizando o email, verifica se já existe outro com o mesmo email
    if (updateRepresentativeDto.email && updateRepresentativeDto.email !== existingRepresentative.email) {
      const existingEmail = await this.prisma.representative.findUnique({
        where: { email: updateRepresentativeDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Já existe um representante com este e-mail');
      }
    }

    // Se estiver atualizando o CPF/CNPJ, verifica se já existe outro com o mesmo CPF/CNPJ
    if (updateRepresentativeDto.cpfCnpj && updateRepresentativeDto.cpfCnpj !== existingRepresentative.cpfCnpj) {
      const existingCpfCnpj = await this.prisma.representative.findUnique({
        where: { cpfCnpj: updateRepresentativeDto.cpfCnpj },
      });

      if (existingCpfCnpj) {
        throw new ConflictException('Já existe um representante com este CPF/CNPJ');
      }
    }

    // Se estiver atualizando a senha, criptografa
    let hashedPassword = existingRepresentative.password;
    if (updateRepresentativeDto.password) {
      hashedPassword = await bcrypt.hash(updateRepresentativeDto.password, 10);
    }

    return this.prisma.representative.update({
      where: { id },
      data: {
        ...updateRepresentativeDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        cpfCnpj: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        specializations: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        loginCount: true,
      },
    });
  }

  async remove(id: string) {
    // Verifica se o representante existe
    const existingRepresentative = await this.prisma.representative.findUnique({
      where: { id },
    });

    if (!existingRepresentative) {
      throw new NotFoundException('Representante não encontrado');
    }

    // Verifica se há tokens vinculados
    const tokensCount = await this.prisma.representative_tokens.count({
      where: { representativeId: id },
    });

    if (tokensCount > 0) {
      throw new BadRequestException(
        'Não é possível excluir o representante pois há tokens vinculados a ele.',
      );
    }

    return this.prisma.representative.delete({
      where: { id },
    });
  }

  async updateLoginStats(id: string) {
    return this.prisma.representative.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
        loginCount: {
          increment: 1,
        },
      },
    });
  }

  async getRepresentativeStats(representativeId: string) {
    const representative = await this.prisma.representative.findUnique({
      where: { id: representativeId },
      include: {
        Consumer: {
          select: {
            id: true,
            status: true,
            averageMonthlyConsumption: true,
            allocatedPercentage: true,
          },
        },
      },
    });

    if (!representative) {
      throw new NotFoundException('Representante não encontrado');
    }

    const totalConsumers = representative.Consumer.length;
    const totalKwh = representative.Consumer.reduce(
      (sum, consumer) => sum + consumer.averageMonthlyConsumption,
      0,
    );

    // Calcula kWh alocados e pendentes
    let allocatedKwh = 0;
    let pendingKwh = 0;

    representative.Consumer.forEach(consumer => {
      if (consumer.status === 'ALLOCATED' && consumer.allocatedPercentage) {
        allocatedKwh += (consumer.averageMonthlyConsumption * consumer.allocatedPercentage) / 100;
      } else {
        pendingKwh += consumer.averageMonthlyConsumption;
      }
    });

    // Conta consumidores por status
    const consumersByStatus = {
      allocated: representative.Consumer.filter(c => c.status === 'ALLOCATED').length,
      inProcess: representative.Consumer.filter(c => c.status === 'IN_PROCESS').length,
      converted: representative.Consumer.filter(c => c.status === 'CONVERTED').length,
      available: representative.Consumer.filter(c => c.status === 'AVAILABLE').length,
    };

    return {
      representative: {
        id: representative.id,
        name: representative.name,
        email: representative.email,
        status: representative.status,
        specializations: representative.specializations,
      },
      stats: {
        totalConsumers,
        totalKwh: Math.round(totalKwh * 100) / 100,
        allocatedKwh: Math.round(allocatedKwh * 100) / 100,
        pendingKwh: Math.round(pendingKwh * 100) / 100,
        allocationRate: totalKwh > 0 ? Math.round((allocatedKwh / totalKwh) * 100 * 100) / 100 : 0,
        loginCount: representative.loginCount,
        lastLogin: representative.lastLoginAt,
      },
      consumersByStatus,
    };
  }

  async getStatistics() {
    const [
      totalRepresentatives,
      activeRepresentatives,
      representativesByStatus,
      representativesByState,
      topRepresentatives,
    ] = await Promise.all([
      // Total de representantes
      this.prisma.representative.count(),
      
      // Representantes ativos
      this.prisma.representative.count({
        where: { status: 'ACTIVE' },
      }),
      
      // Representantes por status
      this.prisma.representative.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      
      // Representantes por estado
      this.prisma.representative.groupBy({
        by: ['state'],
        _count: { state: true },
        orderBy: { _count: { state: 'desc' } },
        take: 10,
      }),
      
      // Top representantes por número de consumidores
      this.prisma.representative.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          state: true,
          _count: {
            select: {
              Consumer: true,
            },
          },
        },
        orderBy: {
          Consumer: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    return {
      totalRepresentatives,
      activeRepresentatives,
      representativesByStatus: representativesByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      representativesByState: representativesByState.map(item => ({
        state: item.state,
        count: item._count.state,
      })),
      topRepresentatives: topRepresentatives.map(rep => ({
        id: rep.id,
        name: rep.name,
        email: rep.email,
        city: rep.city,
        state: rep.state,
        consumerCount: rep._count.Consumer,
      })),
      lastUpdated: new Date().toISOString(),
    };
  }
}
