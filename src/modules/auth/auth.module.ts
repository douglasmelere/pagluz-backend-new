import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RepresentativeJwtStrategy } from './strategies/representative-jwt.strategy';
import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { LogoutService } from '../../common/services/logout.service';
import { RepresentativeAuthGuard } from '../../common/guards/representative-auth.guard';
import { RepresentativeJwtAuthGuard } from '../../common/guards/representative-jwt-auth.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RepresentativeJwtStrategy,
    PrismaService,
    AuditService,
    LogoutService,
    RepresentativeAuthGuard,
    RepresentativeJwtAuthGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    RepresentativeAuthGuard,
    RepresentativeJwtAuthGuard,
    AuditService,
    LogoutService,
  ],
})
export class AuthModule {}

