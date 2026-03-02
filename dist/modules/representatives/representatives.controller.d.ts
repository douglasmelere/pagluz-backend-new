import { RepresentativesService } from './representatives.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';
import { AvatarStorageService } from '../../common/services/avatar-storage.service';
export declare class RepresentativesController {
    private readonly representativesService;
    private readonly avatarStorageService;
    constructor(representativesService: RepresentativesService, avatarStorageService: AvatarStorageService);
    create(createRepresentativeDto: CreateRepresentativeDto): Promise<{
        email: string;
        name: string;
        id: string;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        loginCount: number;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        phone: string;
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        specializations: string[];
        notes: string | null;
    }>;
    findAll(): Promise<{
        email: string;
        name: string;
        id: string;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        loginCount: number;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            Consumer: number;
        };
        cpfCnpj: string;
        phone: string;
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        specializations: string[];
        notes: string | null;
    }[]>;
    getStatistics(): Promise<{
        totalRepresentatives: number;
        activeRepresentatives: number;
        representativesByStatus: {
            status: import(".prisma/client").$Enums.RepresentativeStatus;
            count: number;
        }[];
        representativesByState: {
            state: string;
            count: number;
        }[];
        topRepresentatives: {
            id: string;
            name: string;
            email: string;
            city: string;
            state: string;
            avatarUrl: string | null;
            consumerCount: number;
        }[];
        lastUpdated: string;
    }>;
    findOne(id: string): Promise<{
        email: string;
        name: string;
        id: string;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        loginCount: number;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            Consumer: number;
        };
        cpfCnpj: string;
        phone: string;
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        specializations: string[];
        notes: string | null;
        Consumer: {
            name: string;
            id: string;
            createdAt: Date;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            status: import(".prisma/client").$Enums.ConsumerStatus;
            allocatedPercentage: number | null;
        }[];
    }>;
    update(id: string, updateRepresentativeDto: UpdateRepresentativeDto): Promise<{
        email: string;
        name: string;
        id: string;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        loginCount: number;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        phone: string;
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        specializations: string[];
        notes: string | null;
    }>;
    remove(id: string): Promise<{
        email: string;
        password: string;
        name: string;
        id: string;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        loginCount: number;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        phone: string;
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        specializations: string[];
        notes: string | null;
    }>;
    getRepresentativeStats(req: any): Promise<{
        representative: {
            id: string;
            name: string;
            email: string;
            status: import(".prisma/client").$Enums.RepresentativeStatus;
            specializations: string[];
            avatarUrl: string | null;
        };
        stats: {
            totalConsumers: number;
            totalKwh: number;
            allocatedKwh: number;
            pendingKwh: number;
            allocationRate: number;
            loginCount: number;
            lastLogin: Date | null;
        };
        consumersByStatus: {
            allocated: number;
            inProcess: number;
            converted: number;
            available: number;
        };
    }>;
    getRepresentativeProfile(req: any): Promise<{
        email: string;
        name: string;
        id: string;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        loginCount: number;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            Consumer: number;
        };
        cpfCnpj: string;
        phone: string;
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        specializations: string[];
        notes: string | null;
        Consumer: {
            name: string;
            id: string;
            createdAt: Date;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            status: import(".prisma/client").$Enums.ConsumerStatus;
            allocatedPercentage: number | null;
        }[];
    }>;
    updateRepresentativeProfile(req: any, updateRepresentativeDto: UpdateRepresentativeDto): Promise<{
        email: string;
        name: string;
        id: string;
        avatarUrl: string | null;
        lastLoginAt: Date | null;
        loginCount: number;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        phone: string;
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        specializations: string[];
        notes: string | null;
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
