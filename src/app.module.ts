import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalConfigModule } from './config/config.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConsumersModule } from './modules/consumers/consumers.module';
import { GeneratorsModule } from './modules/generators/generators.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    GlobalConfigModule,
    AuthModule,
    UsersModule,
    ConsumersModule,
    GeneratorsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

