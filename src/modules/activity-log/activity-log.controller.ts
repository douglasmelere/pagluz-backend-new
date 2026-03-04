import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Activity Log / Timeline')
@ApiBearerAuth()
@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly service: ActivityLogService) { }

  // ─── Representante ──────────────────────────────────────────────────────────

  @Get('representative/my-timeline')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Minha timeline de atividades (Representante)' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  getMyTimeline(@Request() req: any, @Query('limit') limit?: string) {
    return this.service.getRepresentativeTimeline(req.user.id, limit ? parseInt(limit) : 50);
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  @Get('admin')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Timeline global de atividades (Admin)' })
  @ApiQuery({ name: 'entityType', required: false, example: 'Consumer' })
  @ApiQuery({ name: 'action', required: false, example: 'CREATED' })
  @ApiQuery({ name: 'representativeId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  getGlobalTimeline(
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('representativeId') representativeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getGlobalTimeline({
      entityType, action, representativeId, startDate, endDate,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  @Get('admin/entity/:entityType/:entityId')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Timeline de uma entidade específica (Admin)' })
  getEntityTimeline(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.service.getEntityTimeline(entityType, entityId);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Estatísticas de atividade (Admin)' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  getStats(@Query('days') days?: string) {
    return this.service.getActivityStats(days ? parseInt(days) : 30);
  }
}
