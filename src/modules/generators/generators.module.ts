import { Module } from '@nestjs/common';
import { GeneratorsService } from './generators.service';
import { GeneratorsController } from './generators.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [GeneratorsController],
  providers: [GeneratorsService, PrismaService],
  exports: [GeneratorsService],
})
export class GeneratorsModule {}

