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
import { CommissionsModule } from './modules/commissions/commissions.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { PrismaService } from './config/prisma.service';
import { AuditService } from './common/services/audit.service';
import { LogoutService } from './common/services/logout.service';
import { HierarchyAuthGuard } from './common/guards/hierarchy-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    ConsumersModule,
    GeneratorsModule,
    DashboardModule,
    RepresentativesModule,
    AuthModule,
    AuditModule,
    CommissionsModule,
    SettingsModule,
    ContractsModule,
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

