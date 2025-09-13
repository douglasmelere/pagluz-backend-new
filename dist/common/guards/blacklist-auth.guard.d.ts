import { CanActivate, ExecutionContext } from '@nestjs/common';
import { LogoutService } from '../services/logout.service';
export declare class BlacklistAuthGuard implements CanActivate {
    private logoutService;
    constructor(logoutService: LogoutService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
