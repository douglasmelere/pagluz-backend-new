import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService, PrismaService, AuditService],
  exports: [SettingsService],
})
export class SettingsModule {}

