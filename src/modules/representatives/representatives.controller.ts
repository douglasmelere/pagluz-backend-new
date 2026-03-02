import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { RepresentativesService } from './representatives.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeAuthGuard } from '../../common/guards/representative-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';
import { AvatarStorageService } from '../../common/services/avatar-storage.service';

@Controller('representatives')
export class RepresentativesController {
  constructor(
    private readonly representativesService: RepresentativesService,
    private readonly avatarStorageService: AvatarStorageService,
  ) { }

  // Rotas administrativas (apenas ADMIN)
  @Post()
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  create(@Body() createRepresentativeDto: CreateRepresentativeDto) {
    return this.representativesService.create(createRepresentativeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  findAll() {
    return this.representativesService.findAll();
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  getStatistics() {
    return this.representativesService.getStatistics();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  findOne(@Param('id') id: string) {
    return this.representativesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateRepresentativeDto: UpdateRepresentativeDto,
  ) {
    return this.representativesService.update(id, updateRepresentativeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.representativesService.remove(id);
  }

  // Rotas para representantes (apenas representantes autenticados)
  @Get('dashboard/stats')
  @UseGuards(RepresentativeAuthGuard)
  getRepresentativeStats(@Request() req) {
    return this.representativesService.getRepresentativeStats(req.user.id);
  }

  // Rota para representante ver seus próprios dados
  @Get('dashboard/profile')
  @UseGuards(RepresentativeAuthGuard)
  getRepresentativeProfile(@Request() req) {
    return this.representativesService.findOne(req.user.id);
  }

  // Rota para representante atualizar seus próprios dados
  @Patch('dashboard/profile')
  @UseGuards(RepresentativeAuthGuard)
  updateRepresentativeProfile(
    @Request() req,
    @Body() updateRepresentativeDto: UpdateRepresentativeDto,
  ) {
    return this.representativesService.update(req.user.id, updateRepresentativeDto);
  }

  // ─── Rotas de foto de perfil ──────────────────────────────────────────────

  @ApiOperation({ summary: 'Representante: fazer upload da própria foto de perfil' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Imagem de perfil (JPEG, PNG ou WebP, máx. 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Foto de perfil atualizada com sucesso' })
  @Post('dashboard/avatar')
  @UseGuards(RepresentativeAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  async uploadMyAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const representativeId = req.user.id;
    const avatarUrl = await this.avatarStorageService.uploadAvatar(
      file,
      'representatives',
      representativeId,
    );
    const updated = await this.representativesService.updateAvatar(representativeId, avatarUrl);
    return { message: 'Foto de perfil atualizada com sucesso', avatarUrl: updated.avatarUrl };
  }

  @ApiOperation({ summary: 'Representante: remover a própria foto de perfil' })
  @ApiResponse({ status: 200, description: 'Foto de perfil removida com sucesso' })
  @Delete('dashboard/avatar')
  @UseGuards(RepresentativeAuthGuard)
  @HttpCode(HttpStatus.OK)
  async removeMyAvatar(@Request() req) {
    const representativeId = req.user.id;
    await this.avatarStorageService.deleteAvatar('representatives', representativeId);
    await this.representativesService.updateAvatar(representativeId, null);
    return { message: 'Foto de perfil removida com sucesso' };
  }

  @ApiOperation({ summary: 'Admin: fazer upload da foto de perfil de um representante' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Imagem de perfil (JPEG, PNG ou WebP, máx. 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Foto de perfil atualizada com sucesso' })
  @Post(':id/avatar')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  async uploadAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = await this.avatarStorageService.uploadAvatar(file, 'representatives', id);
    const updated = await this.representativesService.updateAvatar(id, avatarUrl);
    return { message: 'Foto de perfil atualizada com sucesso', avatarUrl: updated.avatarUrl };
  }

  @ApiOperation({ summary: 'Admin: remover foto de perfil de um representante' })
  @ApiResponse({ status: 200, description: 'Foto de perfil removida com sucesso' })
  @Delete(':id/avatar')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  @HttpCode(HttpStatus.OK)
  async removeAvatar(@Param('id') id: string) {
    await this.avatarStorageService.deleteAvatar('representatives', id);
    await this.representativesService.updateAvatar(id, null);
    return { message: 'Foto de perfil removida com sucesso' };
  }
}
