import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getCurrentKwhPrice(): Promise<number>;
    setKwhPrice(body: {
        price: number;
    }, req: any): Promise<any>;
    getKwhPriceHistory(): Promise<{
        id: string;
        value: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAllSettings(): Promise<{
        id: string;
        key: string;
        value: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    setSetting(body: {
        key: string;
        value: string;
        description?: string;
    }, req: any): Promise<{
        id: any;
        key: any;
        value: any;
        description: any;
        updatedAt: any;
    }>;
    getSystemStats(): Promise<{
        totalConsumers: number;
        totalRepresentatives: number;
        totalCommissions: number;
        totalCommissionsValue: number;
        currentKwhPrice: number;
        lastUpdated: Date;
    }>;
}
