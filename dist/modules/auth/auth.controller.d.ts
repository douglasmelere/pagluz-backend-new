import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutService } from '../../common/services/logout.service';
import { AuditService } from '../../common/services/audit.service';
export declare class AuthController {
    private readonly authService;
    private readonly logoutService;
    private readonly auditService;
    constructor(authService: AuthService, logoutService: LogoutService, auditService: AuditService);
    login(loginDto: LoginDto, req: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            isActive: any;
            lastLoginAt: any;
            loginCount: any;
        };
    }>;
    loginRepresentative(loginDto: LoginDto, req: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: string;
            status: any;
            commissionRate: any;
            lastLoginAt: any;
            loginCount: any;
        };
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    getProfile(req: any): any;
    createAdmin(createUserDto: any, req: any): Promise<{
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    forceLogoutUser(req: any, params: any): Promise<{
        message: string;
    }>;
    private extractIpAddress;
    private extractUserAgent;
}
