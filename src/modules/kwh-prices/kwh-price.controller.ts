import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { KwhPriceService } from './kwh-price.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Preços kWh / Tarifas')
@ApiBearerAuth()
@Controller('kwh-prices')
@UseGuards(JwtAuthGuard, HierarchyAuthGuard)
export class KwhPriceController {
  constructor(private readonly service: KwhPriceService) { }

  @Post()
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Cadastrar novo preço de kWh (fecha o anterior automaticamente)' })
  create(@Body() body: any, @Request() req: any) {
    return this.service.create({ ...body, createdByUserId: req.user.id });
  }

  @Get('current')
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Listar preços vigentes de todas as concessionárias' })
  getCurrentPrices() {
    return this.service.getCurrentPrices();
  }

  @Get('concessionaires')
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Listar todas as concessionárias cadastradas' })
  getConcessionaires() {
    return this.service.getConcessionaires();
  }

  @Get('comparison')
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Comparativo de preços entre concessionárias' })
  getComparison() {
    return this.service.getPriceComparison();
  }

  @Get('history/:concessionaire')
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Histórico de preços de uma concessionária' })
  getHistory(@Param('concessionaire') concessionaire: string) {
    return this.service.getHistory(decodeURIComponent(concessionaire));
  }

  @Get('at-date')
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Preço em uma data específica' })
  @ApiQuery({ name: 'concessionaire', required: true })
  @ApiQuery({ name: 'date', required: true, example: '2026-03-01' })
  getPriceAtDate(
    @Query('concessionaire') concessionaire: string,
    @Query('date') date: string,
  ) {
    return this.service.getPriceAtDate(concessionaire, date);
  }

  @Get(':concessionaire/current')
  @RequireHierarchy('OPERATOR')
  @ApiOperation({ summary: 'Preço vigente de uma concessionária' })
  getCurrentPrice(@Param('concessionaire') concessionaire: string) {
    return this.service.getCurrentPrice(decodeURIComponent(concessionaire));
  }

  @Patch(':id')
  @RequireHierarchy('MANAGER')
  @ApiOperation({ summary: 'Atualizar registro de preço' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @RequireHierarchy('MANAGER')
  @ApiOperation({ summary: 'Excluir registro de preço' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
