import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CommercialMaterialsService } from './commercial-materials.service';
import { CreateCommercialMaterialDto } from './dto/create-commercial-material.dto';
import { UpdateCommercialMaterialDto } from './dto/update-commercial-material.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Commercial Materials')
@ApiBearerAuth()
@Controller('commercial-materials')
export class CommercialMaterialsController {
  constructor(private readonly service: CommercialMaterialsService) { }

  // ────────────────────────────────────────────────────────────
  // Rotas do Representante (app mobile)
  // ────────────────────────────────────────────────────────────

  @Get('representative')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Listar materiais comerciais disponíveis (Representante)' })
  findForRepresentative() {
    return this.service.findAll(true); // apenas ativos
  }

  @Get('representative/:id/download-url')
  @UseGuards(RepresentativeJwtAuthGuard)
  @ApiOperation({ summary: 'Obter URL de download assinada do material (Representante)' })
  getDownloadUrlForRepresentative(@Param('id') id: string) {
    return this.service.getDownloadUrl(id);
  }

  // ────────────────────────────────────────────────────────────
  // Rotas Admin
  // ────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Enviar novo material comercial (Admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'title'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Arquivo (PDF, PPT, imagem, etc.)' },
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
      },
    },
  })
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCommercialMaterialDto,
  ) {
    return this.service.create(file, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Listar todos os materiais comerciais (Admin)' })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean })
  findAll(@Query('onlyActive') onlyActive?: string) {
    return this.service.findAll(onlyActive === 'true');
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Detalhes de um material comercial (Admin)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/download-url')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Obter URL de download assinada (Admin)' })
  getDownloadUrl(@Param('id') id: string) {
    return this.service.getDownloadUrl(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Atualizar metadados de um material (Admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateCommercialMaterialDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('MANAGER')
  @ApiOperation({ summary: 'Excluir material comercial (Admin)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
