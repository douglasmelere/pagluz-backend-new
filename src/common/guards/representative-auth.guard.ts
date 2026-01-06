import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class RepresentativeAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    try {
      // Extrai o token do header Authorization
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token de autorização não fornecido');
      }

      const token = authHeader.substring(7);
      
      // Verifica e decodifica o token JWT
      const payload = this.jwtService.verify(token);
      
      // Verifica se o token é de um representante
      if (payload.role !== 'REPRESENTATIVE') {
        throw new UnauthorizedException('Token inválido para representante');
      }

      // Busca o representante no banco para verificar se ainda existe e está ativo
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

      // Adiciona o representante ao request
      request.user = {
        id: representative.id,
        email: representative.email,
        name: representative.name,
        role: 'REPRESENTATIVE',
        status: representative.status,
        specializations: representative.specializations,
        city: representative.city,
        state: representative.state,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Se for erro de JWT (token inválido, expirado, etc.)
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token inválido ou expirado');
      }
      
      throw new UnauthorizedException('Erro ao autenticar representante');
    }
  }
}
