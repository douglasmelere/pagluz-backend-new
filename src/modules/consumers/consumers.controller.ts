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
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ConsumersService } from './consumers.service';
import { CreateConsumerDto } from './dto/create-consumer.dto';
import { UpdateConsumerDto } from './dto/update-consumer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeAuthGuard } from '../../common/guards/representative-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Consumidores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, HierarchyAuthGuard)
@Controller('consumers')
export class ConsumersController {
  constructor(private readonly consumersService: ConsumersService) {}

  @ApiOperation({ summary: 'Criar novo consumidor' })
  @ApiResponse({ status: 201, description: 'Consumidor criado com sucesso' })
  @ApiResponse({ status: 409, description: 'CPF/CNPJ já está cadastrado' })
  @RequireHierarchy('ADMIN')
  @Post()
  create(@Body() createConsumerDto: CreateConsumerDto) {
    return this.consumersService.create(createConsumerDto);
  }

  @ApiOperation({ summary: 'Criar novo consumidor (Representante)' })
  @ApiResponse({ status: 201, description: 'Consumidor criado com sucesso' })
  @ApiResponse({ status: 409, description: 'CPF/CNPJ já está cadastrado' })
  @Post('representative')
  @UseGuards(RepresentativeAuthGuard)
  createAsRepresentative(
    @Body() createConsumerDto: CreateConsumerDto,
    @Request() req: any,
  ) {
    // O representante logado é automaticamente vinculado
    const representativeId = req.user.id;
    return this.consumersService.createAsRepresentative(createConsumerDto, representativeId);
  }

  @ApiOperation({ summary: 'Listar consumidores do representante logado' })
  @ApiResponse({ status: 200, description: 'Lista de consumidores do representante' })
  @Get('representative/my-consumers')
  @UseGuards(RepresentativeAuthGuard)
  findMyConsumers(@Request() req: any) {
    const representativeId = req.user.id;
    return this.consumersService.findByRepresentative(representativeId);
  }

  @ApiOperation({ summary: 'Listar todos os consumidores' })
  @ApiResponse({ status: 200, description: 'Lista de consumidores' })
  @RequireHierarchy('OPERATOR')
  @Get()
  findAll() {
    return this.consumersService.findAll();
  }

  @ApiOperation({ summary: 'Obter estatísticas dos consumidores' })
  @ApiResponse({ status: 200, description: 'Estatísticas dos consumidores' })
  @RequireHierarchy('OPERATOR')
  @Get('statistics')
  getStatistics() {
    return this.consumersService.getStatistics();
  }

  @ApiOperation({ summary: 'Buscar consumidores por estado' })
  @ApiResponse({ status: 200, description: 'Consumidores do estado' })
  @ApiQuery({ name: 'state', description: 'UF do estado', example: 'SC' })
  @RequireHierarchy('OPERATOR')
  @Get('by-state')
  getByState(@Query('state') state: string) {
    return this.consumersService.getByState(state);
  }

  @ApiOperation({ summary: 'Buscar consumidor por ID' })
  @ApiResponse({ status: 200, description: 'Consumidor encontrado' })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @RequireHierarchy('OPERATOR')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consumersService.findOne(id);
  }

  @ApiOperation({ summary: 'Atualizar consumidor' })
  @ApiResponse({ status: 200, description: 'Consumidor atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @RequireHierarchy('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConsumerDto: UpdateConsumerDto) {
    return this.consumersService.update(id, updateConsumerDto);
  }

  @ApiOperation({ summary: 'Remover consumidor' })
  @ApiResponse({ status: 200, description: 'Consumidor removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @RequireHierarchy('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consumersService.remove(id);
  }

  @ApiOperation({ summary: 'Alocar consumidor a um gerador' })
  @ApiResponse({ status: 200, description: 'Consumidor alocado com sucesso' })
  @ApiResponse({ status: 404, description: 'Consumidor ou gerador não encontrado' })
  @RequireHierarchy('ADMIN')
  @Post(':id/allocate')
  allocateToGenerator(
    @Param('id') consumerId: string,
    @Body() body: { generatorId: string; percentage: number },
  ) {
    return this.consumersService.allocateToGenerator(
      consumerId,
      body.generatorId,
      body.percentage,
    );
  }

  @ApiOperation({ summary: 'Desalocar consumidor de um gerador' })
  @ApiResponse({ status: 200, description: 'Consumidor desalocado com sucesso' })
  @ApiResponse({ status: 404, description: 'Consumidor não encontrado' })
  @RequireHierarchy('ADMIN')
  @Post(':id/deallocate')
  deallocate(@Param('id') consumerId: string) {
    return this.consumersService.deallocate(consumerId);
  }
}

