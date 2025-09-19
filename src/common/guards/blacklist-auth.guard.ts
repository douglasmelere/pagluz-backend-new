import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { LogoutService } from '../services/logout.service';

@Injectable()
export class BlacklistAuthGuard implements CanActivate {
  constructor(private logoutService: LogoutService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.token;

    if (!token) {
      return true; // Se não há token, deixa o JwtAuthGuard lidar
    }

    // Verifica se o token está na blacklist
    const isBlacklisted = await this.logoutService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token inválido (logout realizado)');
    }

    return true;
  }
}
