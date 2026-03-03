import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class SupabaseStorageService implements OnModuleInit {
    private configService;
    private supabase;
    private bucketName;
    private bucketExistsCache;
    private bucketCheckTime;
    private readonly BUCKET_CACHE_TTL;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    uploadFile(file: Express.Multer.File, fileName: string, folder?: string): Promise<{
        url: string;
        path: string;
    }>;
    deleteFile(filePath: string): Promise<void>;
    getPublicUrl(filePath: string): string;
    getSignedUrl(filePath: string, expiresIn?: number): Promise<string>;
    bucketExists(): Promise<boolean>;
    downloadFile(filePath: string): Promise<Buffer>;
}
