import { Module, Global } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { PushNotificationController } from './push-notification.controller';
import { PrismaService } from '../../config/prisma.service';

@Global()
@Module({
  controllers: [PushNotificationController],
  providers: [PushNotificationService, PrismaService],
  exports: [PushNotificationService],
})
export class PushNotificationModule { }
