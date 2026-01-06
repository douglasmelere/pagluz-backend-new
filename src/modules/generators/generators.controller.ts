import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { GeneratorsService } from './generators.service';
import { CreateGeneratorDto } from './dto/create-generator.dto';
import { UpdateGeneratorDto } from './dto/update-generator.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Geradores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, HierarchyAuthGuard)
@Controller('generators')
export class GeneratorsController {
  constructor(private readonly generatorsService: GeneratorsService) {}

  @ApiOperation({ summary: 'Criar novo gerador' })
  @ApiResponse({ status: 201, description: 'Gerador criado com sucesso' })
  @ApiResponse({ status: 409, description: 'CPF/CNPJ já está cadastrado' })
  @RequireHierarchy('ADMIN')
  @Post()
  create(@Body() createGeneratorDto: CreateGeneratorDto) {
    return this.generatorsService.create(createGeneratorDto);
  }

  @ApiOperation({ summary: 'Listar todos os geradores' })
  @ApiResponse({ status: 200, description: 'Lista de geradores' })
  @RequireHierarchy('OPERATOR')
  @Get()
  findAll() {
    return this.generatorsService.findAll();
  }

  @ApiOperation({ summary: 'Obter estatísticas dos geradores' })
  @ApiResponse({ status: 200, description: 'Estatísticas dos geradores' })
  @RequireHierarchy('OPERATOR')
  @Get('statistics')
  getStatistics() {
    return this.generatorsService.getStatistics();
  }

  @ApiOperation({ summary: 'Buscar geradores por estado' })
  @ApiResponse({ status: 200, description: 'Geradores do estado' })
  @ApiQuery({ name: 'state', description: 'UF do estado', example: 'SC' })
  @RequireHierarchy('OPERATOR')
  @Get('by-state')
  getByState(@Query('state') state: string) {
    return this.generatorsService.getByState(state);
  }

  @ApiOperation({ summary: 'Buscar geradores por tipo de fonte' })
  @ApiResponse({ status: 200, description: 'Geradores do tipo de fonte' })
  @ApiQuery({ 
    name: 'sourceType', 
    description: 'Tipo de fonte de energia', 
    example: 'SOLAR',
    enum: ['SOLAR', 'HYDRO', 'BIOMASS', 'WIND']
  })
  @RequireHierarchy('OPERATOR')
  @Get('by-source-type')
  getBySourceType(@Query('sourceType') sourceType: string) {
    return this.generatorsService.getBySourceType(sourceType);
  }

  @ApiOperation({ summary: 'Buscar gerador por ID' })
  @ApiResponse({ status: 200, description: 'Gerador encontrado' })
  @ApiResponse({ status: 404, description: 'Gerador não encontrado' })
  @RequireHierarchy('OPERATOR')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.generatorsService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar gerador' })
  @ApiResponse({ status: 200, description: 'Gerador atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Gerador não encontrado' })
  @RequireHierarchy('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGeneratorDto: UpdateGeneratorDto) {
    return this.generatorsService.update(id, updateGeneratorDto);
  }

  @ApiOperation({ summary: 'Remover gerador' })
  @ApiResponse({ status: 200, description: 'Gerador removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Gerador não encontrado' })
  @ApiResponse({ status: 409, description: 'Gerador possui consumidores alocados' })
  @RequireHierarchy('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.generatorsService.remove(id);
  }
}

