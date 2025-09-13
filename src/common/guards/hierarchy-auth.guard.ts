import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../config/prisma.service';

export const HIERARCHY_KEY = 'hierarchy';
export const RequireHierarchy = (minRole: string) => SetMetadata(HIERARCHY_KEY, minRole);

@Injectable()
export class HierarchyAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.get<string>(HIERARCHY_KEY, context.getHandler());
    
    if (!requiredRole) {
      return true; // Sem restrição de hierarquia
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Busca o usuário atualizado no banco
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, isActive: true, lockedUntil: true },
    });

    if (!currentUser || !currentUser.isActive) {
      throw new ForbiddenException('Usuário inativo ou não encontrado');
    }

    if (currentUser.lockedUntil && currentUser.lockedUntil > new Date()) {
      throw new ForbiddenException('Conta temporariamente bloqueada');
    }

    // Verifica hierarquia
    if (!this.hasRequiredHierarchy(currentUser.role, requiredRole)) {
      throw new ForbiddenException(`Acesso negado. Nível mínimo requerido: ${requiredRole}`);
    }

    return true;
  }

  private hasRequiredHierarchy(userRole: string, requiredRole: string): boolean {
    const hierarchy = {
      'SUPER_ADMIN': 4,
      'ADMIN': 3,
      'MANAGER': 2,
      'OPERATOR': 1,
      'REPRESENTATIVE': 0,
    };

    return hierarchy[userRole] >= hierarchy[requiredRole];
  }
}
