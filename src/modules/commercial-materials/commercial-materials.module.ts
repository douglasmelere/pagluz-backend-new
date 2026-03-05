import { Module } from '@nestjs/common';
import { CommercialMaterialsService } from './commercial-materials.service';
import { CommercialMaterialsController } from './commercial-materials.controller';
import { PrismaService } from '../../config/prisma.service';
import { PushNotificationModule } from '../push-notifications/push-notification.module';

@Module({
  imports: [PushNotificationModule],
  controllers: [CommercialMaterialsController],
  providers: [CommercialMaterialsService, PrismaService],
  exports: [CommercialMaterialsService],
})
export class CommercialMaterialsModule { }
