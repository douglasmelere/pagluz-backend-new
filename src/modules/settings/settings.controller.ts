import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { HierarchyAuthGuard, RequireHierarchy } from '../../common/guards/hierarchy-auth.guard';

@ApiTags('Configurações do Sistema')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({ summary: 'Obter valor atual do kWh' })
  @ApiResponse({ status: 200, description: 'Valor atual do kWh' })
  @Get('kwh-price')
  getCurrentKwhPrice() {
    return this.settingsService.getCurrentKwhPrice();
  }

  @ApiOperation({ summary: 'Definir valor do kWh (Admin)' })
  @ApiResponse({ status: 200, description: 'Valor do kWh atualizado com sucesso' })
  @Post('kwh-price')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  setKwhPrice(
    @Body() body: { price: number },
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.settingsService.setKwhPrice(body.price, userId);
  }

  @ApiOperation({ summary: 'Obter histórico de alterações do preço do kWh' })
  @ApiResponse({ status: 200, description: 'Histórico de alterações' })
  @Get('kwh-price/history')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  getKwhPriceHistory() {
    return this.settingsService.getKwhPriceHistory();
  }

  @ApiOperation({ summary: 'Obter todas as configurações do sistema' })
  @ApiResponse({ status: 200, description: 'Lista de configurações' })
  @Get()
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @ApiOperation({ summary: 'Definir configuração genérica (Admin)' })
  @ApiResponse({ status: 200, description: 'Configuração atualizada com sucesso' })
  @Post()
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  setSetting(
    @Body() body: { key: string; value: string; description?: string },
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.settingsService.setSetting(
      body.key,
      body.value,
      body.description || '',
      userId,
    );
  }

  @ApiOperation({ summary: 'Obter estatísticas do sistema' })
  @ApiResponse({ status: 200, description: 'Estatísticas do sistema' })
  @Get('stats')
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy('ADMIN')
  getSystemStats() {
    return this.settingsService.getSystemStats();
  }
}

