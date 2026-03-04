import { Module } from '@nestjs/common';
import { AdvancedDashboardService } from './advanced-dashboard.service';
import { AdvancedDashboardController } from './advanced-dashboard.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [AdvancedDashboardController],
  providers: [AdvancedDashboardService, PrismaService],
  exports: [AdvancedDashboardService],
})
export class AdvancedDashboardModule { }
