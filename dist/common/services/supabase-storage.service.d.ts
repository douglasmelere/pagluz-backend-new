import { ConfigService } from '@nestjs/config';
export declare class SupabaseStorageService {
    private configService;
    private supabase;
    private bucketName;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, fileName: string, folder?: string): Promise<{
        url: string;
        path: string;
    }>;
    deleteFile(filePath: string): Promise<void>;
    getPublicUrl(filePath: string): string;
    getSignedUrl(filePath: string, expiresIn?: number): Promise<string>;
    downloadFile(filePath: string): Promise<Buffer>;
}
