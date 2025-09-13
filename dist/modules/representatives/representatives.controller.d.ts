import { RepresentativesService } from './representatives.service';
import { CreateRepresentativeDto } from './dto/create-representative.dto';
import { UpdateRepresentativeDto } from './dto/update-representative.dto';
export declare class RepresentativesController {
    private readonly representativesService;
    constructor(representativesService: RepresentativesService);
    create(createRepresentativeDto: CreateRepresentativeDto): Promise<{
        email: string;
        name: string;
        id: string;
        lastLoginAt: Date | null;
        loginCount: number;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        phone: string;
        commissionRate: number;
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
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        phone: string;
        commissionRate: number;
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
            commissionRate: number;
            consumerCount: number;
        }[];
        lastUpdated: string;
    }>;
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
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        Consumer: {
            name: string;
            id: string;
            createdAt: Date;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            status: import(".prisma/client").$Enums.ConsumerStatus;
            allocatedPercentage: number | null;
        }[];
        phone: string;
        commissionRate: number;
        specializations: string[];
        notes: string | null;
    }>;
    update(id: string, updateRepresentativeDto: UpdateRepresentativeDto): Promise<{
        email: string;
        name: string;
        id: string;
        lastLoginAt: Date | null;
        loginCount: number;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        phone: string;
        commissionRate: number;
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
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        phone: string;
        commissionRate: number;
        specializations: string[];
        notes: string | null;
    }>;
    getRepresentativeStats(req: any): Promise<{
        representative: {
            id: string;
            name: string;
            email: string;
            status: import(".prisma/client").$Enums.RepresentativeStatus;
            commissionRate: number;
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
    getRepresentativeProfile(req: any): Promise<{
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
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        Consumer: {
            name: string;
            id: string;
            createdAt: Date;
            cpfCnpj: string;
            averageMonthlyConsumption: number;
            status: import(".prisma/client").$Enums.ConsumerStatus;
            allocatedPercentage: number | null;
        }[];
        phone: string;
        commissionRate: number;
        specializations: string[];
        notes: string | null;
    }>;
    updateRepresentativeProfile(req: any, updateRepresentativeDto: UpdateRepresentativeDto): Promise<{
        email: string;
        name: string;
        id: string;
        lastLoginAt: Date | null;
        loginCount: number;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        city: string;
        state: string;
        status: import(".prisma/client").$Enums.RepresentativeStatus;
        phone: string;
        commissionRate: number;
        specializations: string[];
        notes: string | null;
    }>;
}
