import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
export declare class RepresentativeAuthGuard implements CanActivate {
    private prisma;
    constructor(prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
