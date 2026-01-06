import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { RepresentativeDashboardService } from './representative-dashboard.service';
import { RepresentativeDashboardController } from './representative-dashboard.controller';
import { PrismaService } from '../../config/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DashboardController, RepresentativeDashboardController],
  providers: [DashboardService, RepresentativeDashboardService, PrismaService],
  exports: [DashboardService, RepresentativeDashboardService],
})
export class DashboardModule {}

