import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { GoogleApisService } from '../../common/services/google-apis.service';
import { NumberToWordsService } from '../../common/services/number-to-words.service';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [ContractsController],
  providers: [
    ContractsService,
    GoogleApisService,
    NumberToWordsService,
    PrismaService,
  ],
  exports: [ContractsService],
})
export class ContractsModule {}



