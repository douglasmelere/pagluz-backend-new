import { Module } from '@nestjs/common';
import { CommercialMaterialsService } from './commercial-materials.service';
import { CommercialMaterialsController } from './commercial-materials.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [CommercialMaterialsController],
  providers: [CommercialMaterialsService, PrismaService],
  exports: [CommercialMaterialsService],
})
export class CommercialMaterialsModule { }
