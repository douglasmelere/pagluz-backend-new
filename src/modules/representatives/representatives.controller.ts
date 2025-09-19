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
} from '@nestjs/common';
import { RepresentativesService } from './representatives.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RepresentativeAuthGuard } from '../../common/guards/representative-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@Controller('representatives')
export class RepresentativesController {
  constructor(private readonly representativesService: RepresentativesService) {}

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
}
