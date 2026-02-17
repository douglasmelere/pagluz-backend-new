import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que permite autenticação via header Authorization OU query parameter ?token= para representantes
 * Usa a estratégia 'representative-jwt'
 */
@Injectable()
export class RepresentativeJwtAuthOrQueryGuard extends AuthGuard('representative-jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Se tem token na query string, move para o header
    if (request.query.token) {
      request.headers.authorization = `Bearer ${request.query.token}`;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido ou expirado');
    }
    return user;
  }
}
