import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Chama o método padrão do Passport
    const result = await super.canActivate(context);
    
    if (result) {
      // Adiciona informações extras à requisição
      request.token = this.extractTokenFromHeader(request);
      request.ipAddress = this.extractIpAddress(request);
      request.userAgent = this.extractUserAgent(request);
    }
    
    return result as boolean;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractIpAddress(request: any): string {
    return request.ip || 
           request.connection?.remoteAddress || 
           request.socket?.remoteAddress || 
           request.connection?.socket?.remoteAddress || 
           'unknown';
  }

  private extractUserAgent(request: any): string {
    return request.headers['user-agent'] || 'unknown';
  }
}

