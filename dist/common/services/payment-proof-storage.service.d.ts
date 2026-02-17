import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class PaymentProofStorageService implements OnModuleInit {
    private configService;
    private supabase;
    private bucketName;
    private bucketExistsCache;
    private bucketCheckTime;
    private readonly BUCKET_CACHE_TTL;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    uploadPaymentProof(file: Express.Multer.File, fileName: string, commissionId: string): Promise<{
        url: string;
        path: string;
    }>;
    deletePaymentProof(filePath: string): Promise<void>;
    getPublicUrl(filePath: string): string;
    getSignedUrl(filePath: string, expiresIn?: number): Promise<string>;
    bucketExists(): Promise<boolean>;
    downloadPaymentProof(filePath: string): Promise<Buffer>;
}
