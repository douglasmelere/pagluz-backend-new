import { ExecutionContext } from '@nestjs/common';
declare const RepresentativeJwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class RepresentativeJwtAuthGuard extends RepresentativeJwtAuthGuard_base {
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
    private extractIpAddress;
    private extractUserAgent;
}
export {};
