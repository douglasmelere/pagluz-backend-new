import { Module } from '@nestjs/common';
import { RepresentativesService } from './representatives.service';
import { RepresentativesController } from './representatives.controller';
import { PrismaService } from '../../config/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { AvatarStorageService } from '../../common/services/avatar-storage.service';

@Module({
  imports: [AuthModule],
  controllers: [RepresentativesController],
  providers: [RepresentativesService, PrismaService, AvatarStorageService],
  exports: [RepresentativesService],
})
export class RepresentativesModule { }
