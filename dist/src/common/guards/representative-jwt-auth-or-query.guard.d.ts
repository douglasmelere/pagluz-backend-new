import { ExecutionContext } from '@nestjs/common';
declare const RepresentativeJwtAuthOrQueryGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class RepresentativeJwtAuthOrQueryGuard extends RepresentativeJwtAuthOrQueryGuard_base {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
    handleRequest(err: any, user: any, info: any): any;
}
export {};
