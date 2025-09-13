import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class RepresentativeAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Por enquanto, vamos buscar o primeiro representante ativo para teste
    // TODO: Implementar autenticação real quando resolvermos as dependências
    try {
      const representative = await this.prisma.representative.findFirst({
        where: { status: 'ACTIVE' },
        select: { id: true, email: true, name: true },
      });

      if (!representative) {
        throw new UnauthorizedException('Nenhum representante ativo encontrado');
      }

      request.user = {
        id: representative.id,
        email: representative.email,
        name: representative.name,
        type: 'representative',
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Erro ao autenticar representante');
    }
  }
}
