import { Module } from '@nestjs/common';
import { ConsumersService } from './consumers.service';
import { ConsumerChangeRequestsService } from './consumer-change-requests.service';
import { ConsumersController } from './consumers.controller';
import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { PaymentProofStorageService } from '../../common/services/payment-proof-storage.service';
import { OcrService } from '../../common/services/ocr.service';
import { AuthModule } from '../auth/auth.module';
import { CommissionsService } from '../commissions/commissions.service';
import { SettingsService } from '../settings/settings.service';

@Module({
  imports: [AuthModule],
  controllers: [ConsumersController],
  providers: [
    ConsumersService,
    ConsumerChangeRequestsService,
    PrismaService,
    AuditService,
    CommissionsService,
    SettingsService,
    SupabaseStorageService,
    PaymentProofStorageService,
    OcrService,
  ],
  exports: [ConsumersService, ConsumerChangeRequestsService],
})
export class ConsumersModule { }

