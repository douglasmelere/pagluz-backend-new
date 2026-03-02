import { Module } from '@nestjs/common';
import { AdminNotificationsService } from './admin-notifications.service';
import { AdminNotificationsController } from './admin-notifications.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [AdminNotificationsController],
  providers: [AdminNotificationsService, PrismaService],
  exports: [AdminNotificationsService],
})
export class AdminNotificationsModule { }
