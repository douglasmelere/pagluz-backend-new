import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AvatarStorageService } from '../../common/services/avatar-storage.service';
export declare class UsersController {
    private readonly usersService;
    private readonly avatarStorageService;
    constructor(usersService: UsersService, avatarStorageService: AvatarStorageService);
    create(createUserDto: CreateUserDto): Promise<{
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        isActive: boolean;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        loginCount: number;
        failedLoginAttempts: number;
        lockedUntil: Date | null;
        passwordChangedAt: Date | null;
        passwordResetToken: string | null;
        passwordResetExpires: Date | null;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        name: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        avatarUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    uploadMyAvatar(req: any, file: Express.Multer.File): Promise<{
        message: string;
        avatarUrl: string | null;
    }>;
    removeMyAvatar(req: any): Promise<{
        message: string;
    }>;
    uploadAvatar(id: string, file: Express.Multer.File): Promise<{
        message: string;
        avatarUrl: string | null;
    }>;
    removeAvatar(id: string): Promise<{
        message: string;
    }>;
}
