import { Module } from '@nestjs/common';
import { ConsumersService } from './consumers.service';
import { ConsumersController } from './consumers.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [ConsumersController],
  providers: [ConsumersService, PrismaService],
  exports: [ConsumersService],
})
export class ConsumersModule {}

