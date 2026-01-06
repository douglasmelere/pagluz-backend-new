import { PrismaService } from '../../config/prisma.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';
export declare class RepresentativesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createRepresentativeDto: CreateRepresentativeDto): Promise<{
        email: string;
        name: string;
        id: string;
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
    findOne(id: string): Promise<{
        email: string;
        name: string;
        id: string;
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
    findByEmail(email: string): Promise<{
        email: string;
        password: string;
        name: string;
        id: string;
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
    } | null>;
    update(id: string, updateRepresentativeDto: UpdateRepresentativeDto): Promise<{
        email: string;
        name: string;
        id: string;
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
    updateLoginStats(id: string): Promise<{
        email: string;
        password: string;
        name: string;
        id: string;
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
    getRepresentativeStats(representativeId: string): Promise<{
        representative: {
            id: string;
            name: string;
            email: string;
            status: import(".prisma/client").$Enums.RepresentativeStatus;
            specializations: string[];
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
            consumerCount: number;
        }[];
        lastUpdated: string;
    }>;
}
