import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Comissões')
@ApiBearerAuth()
@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @ApiOperation({ summary: 'Listar comissões do representante logado' })
  @ApiResponse({ status: 200, description: 'Lista de comissões do representante' })
  @Get('representative/my-commissions')
  @UseGuards(RepresentativeJwtAuthGuard)
  getMyCommissions(@Request() req: any) {
    const representativeId = req.user.id;
    return this.commissionsService.getRepresentativeCommissions(representativeId);
  }

  @ApiOperation({ summary: 'Obter estatísticas de comissões do representante' })
  @ApiResponse({ status: 200, description: 'Estatísticas de comissões' })
  @Get('representative/stats')
  @UseGuards(RepresentativeJwtAuthGuard)
  getMyCommissionStats(@Request() req: any) {
    const representativeId = req.user.id;
    return this.commissionsService.getRepresentativeCommissionStats(representativeId);
  }

  @ApiOperation({ summary: 'Buscar comissões por período' })
  @ApiResponse({ status: 200, description: 'Comissões do período especificado' })
  @ApiQuery({ name: 'startDate', description: 'Data inicial (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', description: 'Data final (YYYY-MM-DD)', example: '2024-12-31' })
  @Get('representative/by-period')
  @UseGuards(RepresentativeJwtAuthGuard)
  getCommissionsByPeriod(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const representativeId = req.user.id;
    return this.commissionsService.getCommissionsByPeriod(representativeId, startDate, endDate);
  }

  @ApiOperation({ summary: 'Obter detalhes de uma comissão específica' })
  @ApiResponse({ status: 200, description: 'Detalhes da comissão' })
  @ApiResponse({ status: 404, description: 'Comissão não encontrada' })
  @Get('representative/:id')
  @UseGuards(RepresentativeJwtAuthGuard)
  getCommissionDetails(@Param('id') commissionId: string) {
    return this.commissionsService.getCommissionDetails(commissionId);
  }

  // Endpoints para administradores
  @ApiOperation({ summary: 'Listar todas as comissões (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Lista de todas as comissões' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Get()
  getAllCommissions() {
    return this.commissionsService.getAllCommissions();
  }

  @ApiOperation({ summary: 'Listar comissões pendentes (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Lista de comissões pendentes' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Get('pending')
  getPendingCommissions() {
    return this.commissionsService.getPendingCommissions();
  }

  @ApiOperation({ summary: 'Marcar comissão como paga (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Comissão marcada como paga com sucesso' })
  @ApiResponse({ status: 404, description: 'Comissão não encontrada' })
  @Post(':id/mark-paid')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  markCommissionAsPaid(@Param('id') commissionId: string, @Request() req: any) {
    const userId = req.user.id;
    return this.commissionsService.markCommissionAsPaid(commissionId, userId);
  }

  @ApiOperation({ summary: 'Obter estatísticas gerais de comissões (Admin/Operator)' })
  @ApiResponse({ status: 200, description: 'Estatísticas gerais de comissões' })
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @Get('admin/stats')
  async getAdminCommissionStats() {
    // Implementar estatísticas gerais para administradores
    // Por enquanto, retorna uma estrutura básica
    return {
      message: 'Estatísticas gerais de comissões - Em desenvolvimento',
      totalCommissions: 0,
      totalValue: 0,
      pendingCommissions: 0,
      paidCommissions: 0,
    };
  }
}
