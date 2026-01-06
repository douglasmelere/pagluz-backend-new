import { Module } from '@nestjs/common';
import { CommissionsService } from './commissions.service';
import { CommissionsController } from './commissions.controller';
import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { SettingsService } from '../settings/settings.service';

@Module({
  controllers: [CommissionsController],
  providers: [CommissionsService, PrismaService, AuditService, SettingsService],
  exports: [CommissionsService],
})
export class CommissionsModule {}
