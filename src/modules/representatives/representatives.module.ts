import { Module } from '@nestjs/common';
import { RepresentativesService } from './representatives.service';
import { RepresentativesController } from './representatives.controller';
import { PrismaService } from '../../config/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [RepresentativesController],
  providers: [RepresentativesService, PrismaService],
  exports: [RepresentativesService],
})
export class RepresentativesModule {}
