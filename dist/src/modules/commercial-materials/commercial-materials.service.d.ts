import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { CreateCommercialMaterialDto } from './dto/create-commercial-material.dto';
import { UpdateCommercialMaterialDto } from './dto/update-commercial-material.dto';
export declare class CommercialMaterialsService {
    private prisma;
    private configService;
    private supabase;
    private readonly BUCKET_NAME;
    constructor(prisma: PrismaService, configService: ConfigService);
    create(file: Express.Multer.File, dto: CreateCommercialMaterialDto): Promise<{
        description: string | null;
        title: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        fileName: string;
        category: string | null;
        fileUrl: string;
        fileType: string;
        fileSize: number | null;
        uploadedAt: Date;
    }>;
    findAll(onlyActive?: boolean): Promise<{
        description: string | null;
        title: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        fileName: string;
        category: string | null;
        fileUrl: string;
        fileType: string;
        fileSize: number | null;
        uploadedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        description: string | null;
        title: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        fileName: string;
        category: string | null;
        fileUrl: string;
        fileType: string;
        fileSize: number | null;
        uploadedAt: Date;
    }>;
    update(id: string, dto: UpdateCommercialMaterialDto): Promise<{
        description: string | null;
        title: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        fileName: string;
        category: string | null;
        fileUrl: string;
        fileType: string;
        fileSize: number | null;
        uploadedAt: Date;
    }>;
    remove(id: string): Promise<{
        description: string | null;
        title: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        fileName: string;
        category: string | null;
        fileUrl: string;
        fileType: string;
        fileSize: number | null;
        uploadedAt: Date;
    }>;
    getDownloadUrl(id: string): Promise<{
        url: string;
        fileName: string;
    }>;
}
