import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../config/prisma.service';
import { AvatarStorageService } from '../../common/services/avatar-storage.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, AvatarStorageService],
  exports: [UsersService],
})
export class UsersModule { }
