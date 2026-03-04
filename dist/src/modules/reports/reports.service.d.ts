import { PrismaService } from '../../config/prisma.service';
import { Response } from 'express';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    generateCommissionsReport(res: Response, filters: {
        representativeId?: string;
        startDate?: string;
        endDate?: string;
        status?: string;
    }): Promise<void>;
    generateConsumersReport(res: Response, filters: {
        representativeId?: string;
        status?: string;
        concessionaire?: string;
    }): Promise<void>;
    generateRepresentativesReport(res: Response): Promise<void>;
}
