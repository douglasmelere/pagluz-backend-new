import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) { }

  // ────────────────────────────────────────────────────────────
  // Rotas do Representante (app mobile)
  // ────────────────────────────────────────────────────────────

  @Get('representative/my-announcements')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Listar comunicados visíveis para o representante logado' })
  findForRepresentative(@Request() req: any) {
    return this.service.findForRepresentative(req.user.id);
  }

  @Get('representative/unread-count')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Contar comunicados não lidos (Representante)' })
  countUnread(@Request() req: any) {
    return this.service.countUnread(req.user.id);
  }

  @Patch('representative/:id/read')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Marcar comunicado como lido (Representante)' })
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.service.markAsRead(id, req.user.id);
  }

  // ────────────────────────────────────────────────────────────
  // Rotas Admin
  // ────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({
    summary: 'Criar comunicado (Admin) — deixe representativeId vazio para enviar a todos',
  })
  create(@Body() dto: CreateAnnouncementDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Listar todos os comunicados (Admin)' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Detalhes de um comunicado (Admin)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('MANAGER')
  @ApiOperation({ summary: 'Excluir comunicado (Admin)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
