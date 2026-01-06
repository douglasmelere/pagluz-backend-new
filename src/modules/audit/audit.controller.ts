import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../config/prisma.service';

@ApiTags('Auditoria')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private prisma: PrismaService) {}

  @ApiOperation({ summary: 'Listar logs de auditoria (apenas SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Lista de logs de auditoria' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filtrar por usuário' })
  @ApiQuery({ name: 'action', required: false, description: 'Filtrar por ação' })
  @ApiQuery({ name: 'entityType', required: false, description: 'Filtrar por tipo de entidade' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial (ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final (ISO)' })
  @Get('logs')
  async getAuditLogs(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Verifica se o usuário é SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new HttpException('Apenas SUPER_ADMIN pode acessar logs de auditoria', HttpStatus.FORBIDDEN);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Constrói filtros
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (action) {
      where.action = action;
    }
    
    if (entityType) {
      where.entityType = entityType;
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

    // Busca logs com paginação
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
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
        skip,
        take: limitNum,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    // Formata os logs
    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      oldValues: log.oldValues,
      newValues: log.newValues,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata,
      createdAt: log.createdAt,
      user: log.user,
    }));

    return {
      logs: formattedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }

  @ApiOperation({ summary: 'Estatísticas de auditoria (apenas SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Estatísticas dos logs' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @Get('statistics')
  async getAuditStatistics(@Request() req: any) {
    // Verifica se o usuário é SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new HttpException('Apenas SUPER_ADMIN pode acessar estatísticas de auditoria', HttpStatus.FORBIDDEN);
    }

    const [
      totalLogs,
      actionsByType,
      usersByActivity,
      recentActivity,
      securityEvents,
    ] = await Promise.all([
      // Total de logs
      this.prisma.auditLog.count(),
      
      // Ações por tipo
      this.prisma.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      
      // Usuários mais ativos
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
      
      // Atividade recente (últimas 24h)
      this.prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // Eventos de segurança
      this.prisma.auditLog.count({
        where: {
          action: {
            in: ['LOGIN_FAILED', 'TOKEN_INVALIDATED', 'FORCE_LOGOUT_ALL', 'FORCE_LOGOUT_USER'],
          },
        },
      }),
    ]);

    // Busca informações dos usuários mais ativos
    const topUsers = await Promise.all(
      usersByActivity.map(async (user) => {
        if (!user.userId) {
          return {
            userId: null,
            name: 'Usuário removido',
            email: 'N/A',
            role: 'N/A',
            actionCount: user._count.userId,
          };
        }
        const userInfo = await this.prisma.user.findUnique({
          where: { id: user.userId as string },
          select: { name: true, email: true, role: true },
        });
        return {
          userId: user.userId,
          name: userInfo?.name || 'Usuário removido',
          email: userInfo?.email || 'N/A',
          role: userInfo?.role || 'N/A',
          actionCount: user._count.userId,
        };
      })
    );

    return {
      totalLogs,
      actionsByType: actionsByType.map(item => ({
        action: item.action,
        count: item._count.action,
      })),
      topUsers,
      recentActivity,
      securityEvents,
      lastUpdated: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: 'Logs de um usuário específico (apenas SUPER_ADMIN)' })
  @ApiResponse({ status: 200, description: 'Logs do usuário' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @Get('user/:userId')
  async getUserAuditLogs(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    // Verifica se o usuário é SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new HttpException('Apenas SUPER_ADMIN pode acessar logs de auditoria', HttpStatus.FORBIDDEN);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { userId: req.params.userId },
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.auditLog.count({
        where: { userId: req.params.userId },
      }),
    ]);

    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      oldValues: log.oldValues,
      newValues: log.newValues,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata,
      createdAt: log.createdAt,
    }));

    return {
      logs: formattedLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    };
  }
}
