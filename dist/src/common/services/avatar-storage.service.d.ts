import { ConfigService } from '@nestjs/config';
export declare class AvatarStorageService {
    private configService;
    private readonly supabase;
    private readonly logger;
    constructor(configService: ConfigService);
    uploadAvatar(file: Express.Multer.File, entityType: 'users' | 'representatives', entityId: string): Promise<string>;
    deleteAvatar(entityType: 'users' | 'representatives', entityId: string): Promise<void>;
    private validateFile;
    private getExtensionFromMime;
}
