import { Module } from '@nestjs/common';
import { FeedbacksService } from './feedbacks.service';
import { FeedbacksController } from './feedbacks.controller';
import { PrismaService } from '../../config/prisma.service';

@Module({
  controllers: [FeedbacksController],
  providers: [FeedbacksService, PrismaService],
  exports: [FeedbacksService],
})
export class FeedbacksModule { }
