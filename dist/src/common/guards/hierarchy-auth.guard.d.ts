import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../config/prisma.service';
export declare const HIERARCHY_KEY = "hierarchy";
export declare const RequireHierarchy: (minRole: string) => import("@nestjs/common").CustomDecorator<string>;
export declare class HierarchyAuthGuard implements CanActivate {
    private reflector;
    private prisma;
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private hasRequiredHierarchy;
}
