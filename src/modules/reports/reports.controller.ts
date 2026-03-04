import { Controller, Get, Res, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Relatórios')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, HierarchyAuthGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) { }

  @Get('commissions')
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Exportar relatório de comissões (Excel)' })
  @ApiQuery({ name: 'representativeId', required: false })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'CALCULATED', 'PAID', 'CANCELLED'] })
  exportCommissions(
    @Res() res: Response,
    @Query('representativeId') representativeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.service.generateCommissionsReport(res, { representativeId, startDate, endDate, status });
  }

  @Get('consumers')
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Exportar relatório de consumidores (Excel)' })
  @ApiQuery({ name: 'representativeId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['AVAILABLE', 'ALLOCATED', 'IN_PROCESS', 'CONVERTED'] })
  @ApiQuery({ name: 'concessionaire', required: false })
  exportConsumers(
    @Res() res: Response,
    @Query('representativeId') representativeId?: string,
    @Query('status') status?: string,
    @Query('concessionaire') concessionaire?: string,
  ) {
    return this.service.generateConsumersReport(res, { representativeId, status, concessionaire });
  }

  @Get('representatives')
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Exportar relatório de performance dos representantes (Excel)' })
  exportRepresentatives(@Res() res: Response) {
    return this.service.generateRepresentativesReport(res);
  }
}
