import { Module } from '@nestjs/common';
import { KwhPriceService } from './kwh-price.service';
import { KwhPriceController } from './kwh-price.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [KwhPriceController],
  providers: [KwhPriceService, PrismaService],
  exports: [KwhPriceService],
})
export class KwhPriceModule { }
