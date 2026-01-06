import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../config/prisma.service';

export interface RepresentativeJwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

@Injectable()
export class RepresentativeJwtStrategy extends PassportStrategy(Strategy, 'representative-jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Keep this in sync with JwtModule.registerAsync secret
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: RepresentativeJwtPayload) {
    // Verifica se é um token de representante
    if (payload.role !== 'REPRESENTATIVE') {
      throw new UnauthorizedException('Token inválido para representante');
    }

    const representative = await this.prisma.representative.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        specializations: true,
        city: true,
        state: true,
      },
    });

    if (!representative) {
      throw new UnauthorizedException('Representante não encontrado');
    }

    if (representative.status !== 'ACTIVE') {
      throw new UnauthorizedException('Representante não está ativo');
    }

    return {
      id: representative.id,
      email: representative.email,
      name: representative.name,
      role: 'REPRESENTATIVE',
      status: representative.status,
      specializations: representative.specializations,
      city: representative.city,
      state: representative.state,
    };
  }
}

