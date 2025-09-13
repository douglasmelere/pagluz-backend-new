import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ConsumersModule } from './modules/consumers/consumers.module';
import { GeneratorsModule } from './modules/generators/generators.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RepresentativesModule } from './modules/representatives/representatives.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuditModule } from './modules/audit/audit.module';
import { PrismaService } from './config/prisma.service';
import { AuditService } from './common/services/audit.service';
import { LogoutService } from './common/services/logout.service';
import { HierarchyAuthGuard } from './common/guards/hierarchy-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    ConsumersModule,
    GeneratorsModule,
    DashboardModule,
    RepresentativesModule,
    AuthModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    AuditService,
    LogoutService,
    HierarchyAuthGuard,
  ],
  exports: [AuditService, LogoutService],
})
export class AppModule {}

