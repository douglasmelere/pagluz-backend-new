import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdvancedDashboardService } from './advanced-dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Dashboard Avançado')
@ApiBearerAuth()
@Controller('advanced-dashboard')
export class AdvancedDashboardController {
  constructor(private readonly service: AdvancedDashboardService) { }

  // ─── Representante ──────────────────────────────────────────────────────────

  @Get('representative/full')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Dashboard completo com gráficos (Representante)' })
  @ApiQuery({ name: 'months', required: false, example: 12 })
  getRepDashboard(@Request() req: any, @Query('months') months?: string) {
    return this.service.getFullDashboard(months ? parseInt(months) : 12, req.user.id);
  }

  @Get('representative/consumer-growth')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Evolução de consumidores (Representante)' })
  @ApiQuery({ name: 'months', required: false, example: 12 })
  getRepConsumerGrowth(@Request() req: any, @Query('months') months?: string) {
    return this.service.getConsumerGrowth(months ? parseInt(months) : 12, req.user.id);
  }

  @Get('representative/commission-growth')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Evolução de comissões (Representante)' })
  @ApiQuery({ name: 'months', required: false, example: 12 })
  getRepCommissionGrowth(@Request() req: any, @Query('months') months?: string) {
    return this.service.getCommissionGrowth(months ? parseInt(months) : 12, req.user.id);
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  @Get('admin/full')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Dashboard completo com gráficos (Admin)' })
  @ApiQuery({ name: 'months', required: false, example: 12 })
  @ApiQuery({ name: 'representativeId', required: false })
  getAdminDashboard(
    @Query('months') months?: string,
    @Query('representativeId') representativeId?: string,
  ) {
    return this.service.getFullDashboard(months ? parseInt(months) : 12, representativeId);
  }

  @Get('admin/consumer-growth')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Evolução de consumidores (Admin)' })
  @ApiQuery({ name: 'months', required: false })
  @ApiQuery({ name: 'representativeId', required: false })
  getConsumerGrowth(
    @Query('months') months?: string,
    @Query('representativeId') representativeId?: string,
  ) {
    return this.service.getConsumerGrowth(months ? parseInt(months) : 12, representativeId);
  }

  @Get('admin/commission-growth')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Evolução de comissões (Admin)' })
  @ApiQuery({ name: 'months', required: false })
  @ApiQuery({ name: 'representativeId', required: false })
  getCommissionGrowth(
    @Query('months') months?: string,
    @Query('representativeId') representativeId?: string,
  ) {
    return this.service.getCommissionGrowth(months ? parseInt(months) : 12, representativeId);
  }

  @Get('admin/kwh-evolution')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Evolução de kWh alocado (Admin)' })
  @ApiQuery({ name: 'months', required: false })
  @ApiQuery({ name: 'representativeId', required: false })
  getKwhEvolution(
    @Query('months') months?: string,
    @Query('representativeId') representativeId?: string,
  ) {
    return this.service.getKwhEvolution(months ? parseInt(months) : 12, representativeId);
  }

  @Get('admin/concessionaire-distribution')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Distribuição por concessionária (Admin)' })
  getConcessionaireDistribution(@Query('representativeId') representativeId?: string) {
    return this.service.getConcessionaireDistribution(representativeId);
  }

  @Get('admin/consumer-type-distribution')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Distribuição por tipo de consumidor (Admin)' })
  getConsumerTypeDistribution(@Query('representativeId') representativeId?: string) {
    return this.service.getConsumerTypeDistribution(representativeId);
  }

  @Get('admin/geographic-distribution')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Distribuição geográfica (Admin)' })
  getGeographicDistribution(@Query('representativeId') representativeId?: string) {
    return this.service.getGeographicDistribution(representativeId);
  }
}
