import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';

@Module({
  controllers: [AuditController],
  providers: [PrismaService, AuditService],
  exports: [AuditService],
})
export class AuditModule {}
