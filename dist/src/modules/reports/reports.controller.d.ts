import { Response } from 'express';
import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly service;
    constructor(service: ReportsService);
    exportCommissions(res: Response, representativeId?: string, startDate?: string, endDate?: string, status?: string): Promise<void>;
    exportConsumers(res: Response, representativeId?: string, status?: string, concessionaire?: string): Promise<void>;
    exportRepresentatives(res: Response): Promise<void>;
}
