import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { TerminusModule } from "@nestjs/terminus";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./modules/users/users.module";
import { ConsumersModule } from "./modules/consumers/consumers.module";
import { GeneratorsModule } from "./modules/generators/generators.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { RepresentativesModule } from "./modules/representatives/representatives.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AuditModule } from "./modules/audit/audit.module";
import { CommissionsModule } from "./modules/commissions/commissions.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { ContractsModule } from "./modules/contracts/contracts.module";
import { AdminNotificationsModule } from "./modules/admin-notifications/admin-notifications.module";
import { ProposalRequestsModule } from "./modules/proposal-requests/proposal-requests.module";
import { PrismaService } from "./config/prisma.service";
import { AuditService } from "./common/services/audit.service";
import { LogoutService } from "./common/services/logout.service";
import { LoggerServiceImpl } from "./common/services/logger.service";
import { WebhookService } from "./common/services/webhook.service";
import { HierarchyAuthGuard } from "./common/guards/hierarchy-auth.guard";
import {
  CustomThrottlerGuard,
  throttlerConfig,
} from "./common/config/throttler.config";
import { HealthController } from "./common/controllers/health.controller";
import { MetricsController } from "./common/controllers/metrics.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ThrottlerModule.forRoot(throttlerConfig()),
    TerminusModule,
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
    AdminNotificationsModule,
    ProposalRequestsModule,
  ],
  controllers: [AppController, HealthController, MetricsController],
  providers: [
    AppService,
    PrismaService,
    AuditService,
    LogoutService,
    LoggerServiceImpl,
    WebhookService,
    HierarchyAuthGuard,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
  exports: [AuditService, LogoutService, LoggerServiceImpl, WebhookService],
})
export class AppModule { }
