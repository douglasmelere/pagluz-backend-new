import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ 
    summary: 'Obter dados completos da dashboard',
    description: 'Retorna todos os indicadores, estatísticas e insights da dashboard'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dados da dashboard obtidos com sucesso',
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'object',
          properties: {
            totalGenerators: { type: 'number', description: 'Total de geradores cadastrados' },
            totalConsumers: { type: 'number', description: 'Total de consumidores cadastrados' },
            totalInstalledPower: { type: 'number', description: 'Potência instalada total (kWh)' },
            newClientsThisWeek: { type: 'number', description: 'Novos clientes na semana' },
            newGeneratorsThisWeek: { type: 'number', description: 'Novos geradores na semana' },
            newConsumersThisWeek: { type: 'number', description: 'Novos consumidores na semana' },
          },
        },
        stateDistribution: {
          type: 'array',
          description: 'Distribuição por estado',
          items: {
            type: 'object',
            properties: {
              state: { type: 'string' },
              generators: { type: 'number' },
              consumers: { type: 'number' },
              totalInstalledPower: { type: 'number' },
              totalConsumption: { type: 'number' },
            },
          },
        },
        recentActivity: {
          type: 'array',
          description: 'Atividade recente no sistema',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string', enum: ['generator', 'consumer'] },
              name: { type: 'string' },
              subtype: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        insights: {
          type: 'object',
          properties: {
            totalMonthlyConsumption: { type: 'number', description: 'Consumo total mensal (kWh)' },
            allocationRate: { type: 'number', description: 'Taxa de alocação (%)' },
            estimatedMonthlySavings: { type: 'number', description: 'Economia estimada mensal (R$)' },
            totalAllocatedEnergy: { type: 'number', description: 'Energia total alocada (kWh)' },
            capacityUtilization: {
              type: 'object',
              properties: {
                totalCapacity: { type: 'number' },
                allocatedCapacity: { type: 'number' },
                availableCapacity: { type: 'number' },
                utilizationRate: { type: 'number' },
              },
            },
            generatorStatus: {
              type: 'object',
              properties: {
                underAnalysis: { type: 'number' },
                awaitingAllocation: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  @Get()
  getDashboard() {
    return this.dashboardService.getDashboardData();
  }

  @ApiOperation({ 
    summary: 'Obter distribuição de geradores por tipo de fonte',
    description: 'Retorna a quantidade e potência total por tipo de fonte de energia'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Distribuição por tipo de fonte obtida com sucesso'
  })
  @Get('generators-by-source')
  getGeneratorsBySourceType() {
    return this.dashboardService.getGeneratorsBySourceType();
  }

  @ApiOperation({ 
    summary: 'Obter distribuição de consumidores por tipo',
    description: 'Retorna a quantidade e consumo total por tipo de consumidor'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Distribuição por tipo de consumidor obtida com sucesso'
  })
  @Get('consumers-by-type')
  getConsumersByType() {
    return this.dashboardService.getConsumersByType();
  }
}

