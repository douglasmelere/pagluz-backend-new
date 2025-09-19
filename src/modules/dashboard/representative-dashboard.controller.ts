import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RepresentativeDashboardService } from './representative-dashboard.service';
import { RepresentativeAuthGuard } from '../../common/guards/representative-auth.guard';

@ApiTags('Dashboard do Representante')
@Controller('representative-dashboard')
export class RepresentativeDashboardController {
  constructor(private readonly representativeDashboardService: RepresentativeDashboardService) {}

  @ApiOperation({ summary: 'Obter dashboard completo do representante' })
  @ApiResponse({ status: 200, description: 'Dashboard do representante' })
  @ApiBearerAuth()
  @UseGuards(RepresentativeAuthGuard)
  @Get()
  getDashboard(@Request() req) {
    return this.representativeDashboardService.getRepresentativeDashboard(req.user.id);
  }

  @ApiOperation({ summary: 'Obter materiais comerciais' })
  @ApiResponse({ status: 200, description: 'Lista de materiais comerciais' })
  @ApiBearerAuth()
  @UseGuards(RepresentativeAuthGuard)
  @Get('materials')
  getCommercialMaterials() {
    return this.representativeDashboardService.getCommercialMaterials();
  }
}
