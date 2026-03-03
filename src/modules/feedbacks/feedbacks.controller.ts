import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { RespondFeedbackDto } from './dto/respond-feedback.dto';
import { UpdateFeedbackStatusDto } from './dto/update-feedback-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Feedbacks')
@ApiBearerAuth()
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly service: FeedbacksService) { }

  // ════════════════════════════════════════════════════════════════════════════
  //  ROTAS DO REPRESENTANTE
  // ════════════════════════════════════════════════════════════════════════════

  @Post('representative')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Criar feedback (Representante)' })
  @ApiResponse({ status: 201, description: 'Feedback criado com sucesso' })
  create(@Request() req: any, @Body() dto: CreateFeedbackDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get('representative/my-feedbacks')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Listar meus feedbacks (Representante)' })
  @ApiResponse({ status: 200, description: 'Lista de feedbacks do representante' })
  findMyFeedbacks(@Request() req: any) {
    return this.service.findByRepresentative(req.user.id);
  }

  @Get('representative/counts')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Contagem de feedbacks por status (Representante)' })
  @ApiResponse({ status: 200, description: 'Contagem de feedbacks' })
  countMyFeedbacks(@Request() req: any) {
    return this.service.countByRepresentative(req.user.id);
  }

  @Get('representative/:id')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Ver detalhes de um feedback (Representante)' })
  @ApiResponse({ status: 200, description: 'Detalhes do feedback' })
  findOneMy(@Param('id') id: string, @Request() req: any) {
    return this.service.findOneByRepresentative(id, req.user.id);
  }

  @Post('representative/:id/respond')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Responder no thread do feedback (Representante)' })
  @ApiResponse({ status: 201, description: 'Resposta adicionada com sucesso' })
  respondAsRepresentative(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: RespondFeedbackDto,
  ) {
    return this.service.respondAsRepresentative(id, req.user.id, req.user.name, dto);
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  ROTAS ADMIN
  // ════════════════════════════════════════════════════════════════════════════

  @Get('admin')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Listar todos os feedbacks (Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de todos os feedbacks' })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'IN_ANALYSIS', 'RESOLVED', 'REJECTED'] })
  @ApiQuery({ name: 'type', required: false, enum: ['COMPLAINT', 'SUGGESTION', 'BUG', 'PRAISE'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiQuery({ name: 'representativeId', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('priority') priority?: string,
    @Query('representativeId') representativeId?: string,
  ) {
    return this.service.findAll({ status, type, priority, representativeId });
  }

  @Get('admin/metrics')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Métricas dos feedbacks (Admin)' })
  @ApiResponse({ status: 200, description: 'Métricas globais dos feedbacks' })
  getMetrics() {
    return this.service.getMetrics();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Detalhes de um feedback (Admin)' })
  @ApiResponse({ status: 200, description: 'Detalhes do feedback com respostas' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Atualizar status/prioridade de um feedback (Admin)' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateFeedbackStatusDto,
  ) {
    return this.service.updateStatus(id, dto, req.user.id);
  }

  @Post('admin/:id/respond')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Responder feedback (Admin)' })
  @ApiResponse({ status: 201, description: 'Resposta do admin adicionada' })
  respondAsAdmin(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: RespondFeedbackDto,
  ) {
    return this.service.respondAsAdmin(id, req.user.id, req.user.name, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('MANAGER')
  @ApiOperation({ summary: 'Excluir feedback (Admin - Manager+)' })
  @ApiResponse({ status: 200, description: 'Feedback excluído' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
