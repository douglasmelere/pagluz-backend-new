import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RankingService } from './ranking.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Ranking & Gamificação')
@ApiBearerAuth()
@Controller('ranking')
export class RankingController {
  constructor(private readonly service: RankingService) { }

  // ─── Público (Representantes) ───────────────────────────────────────────────

  @Get('leaderboard')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Ranking dos representantes (Representante)' })
  @ApiQuery({ name: 'period', required: false, enum: ['month', 'quarter', 'year', 'all'] })
  getLeaderboard(@Query('period') period?: string) {
    return this.service.getRanking(period);
  }

  @Get('my-badges')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Minhas conquistas/badges (Representante)' })
  getMyBadges(@Request() req: any) {
    return this.service.getBadges(req.user.id);
  }

  @Post('check-badges')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Verificar e ganhar novas conquistas (Representante)' })
  checkMyBadges(@Request() req: any) {
    return this.service.checkAndAwardBadges(req.user.id);
  }

  @Get('my-goals')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Minhas metas (Representante)' })
  getMyGoals(@Request() req: any) {
    return this.service.getGoals(req.user.id);
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  @Get('admin/leaderboard')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Ranking completo (Admin)' })
  @ApiQuery({ name: 'period', required: false, enum: ['month', 'quarter', 'year', 'all'] })
  getAdminLeaderboard(@Query('period') period?: string) {
    return this.service.getRanking(period);
  }

  @Get('admin/goals')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Todas as metas (Admin)' })
  @ApiQuery({ name: 'representativeId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['IN_PROGRESS', 'ACHIEVED', 'FAILED', 'CANCELLED'] })
  getAllGoals(
    @Query('representativeId') representativeId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.getAllGoals({ representativeId, status });
  }

  @Post('admin/goals')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Criar meta para representante (Admin)' })
  createGoal(@Body() body: any, @Request() req: any) {
    return this.service.createGoal({ ...body, createdByUserId: req.user.id });
  }

  @Patch('admin/goals/:id/progress')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Atualizar progresso de meta (Admin)' })
  updateGoalProgress(@Param('id') id: string, @Body() body: { currentValue: number }) {
    return this.service.updateGoalProgress(id, body.currentValue);
  }

  @Post('admin/check-badges/:representativeId')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Verificar badges de um representante (Admin)' })
  checkBadges(@Param('representativeId') id: string) {
    return this.service.checkAndAwardBadges(id);
  }
}
