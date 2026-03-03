import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private jwtService;
    private prisma;
    constructor(jwtService: JwtService, prisma: PrismaService);
    login(loginDto: LoginDto): Promise<{
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
    validateUser(email: string, password: string): Promise<any>;
    loginRepresentative(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: string;
            status: any;
            lastLoginAt: any;
            loginCount: any;
        };
    }>;
    validateRepresentative(email: string, password: string): Promise<any>;
    createAdmin(createUserDto: any): Promise<{
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createDefaultAdmin(): Promise<{
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
