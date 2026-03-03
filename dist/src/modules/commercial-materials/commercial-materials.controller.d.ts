import { CommercialMaterialsService } from './commercial-materials.service';
import { CreateCommercialMaterialDto } from './dto/create-commercial-material.dto';
import { UpdateCommercialMaterialDto } from './dto/update-commercial-material.dto';
export declare class CommercialMaterialsController {
    private readonly service;
    constructor(service: CommercialMaterialsService);
    findForRepresentative(): Promise<{
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
    getDownloadUrlForRepresentative(id: string): Promise<{
        url: string;
        fileName: string;
    }>;
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
    findAll(onlyActive?: string): Promise<{
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
    getDownloadUrl(id: string): Promise<{
        url: string;
        fileName: string;
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
}
