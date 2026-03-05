import { Module } from '@nestjs/common';
import { ProposalRequestsService } from './proposal-requests.service';
import { ProposalRequestsController } from './proposal-requests.controller';
import { AdminNotificationsModule } from '../admin-notifications/admin-notifications.module';
import { PrismaService } from '../../config/prisma.service';
import { WebhookService } from '../../common/services/webhook.service';
import { PushNotificationModule } from '../push-notifications/push-notification.module';

@Module({
  imports: [AdminNotificationsModule, PushNotificationModule],
  controllers: [ProposalRequestsController],
  providers: [ProposalRequestsService, PrismaService, WebhookService],
})
export class ProposalRequestsModule { }
