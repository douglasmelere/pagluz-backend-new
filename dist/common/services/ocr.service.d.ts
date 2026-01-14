export declare class OcrService {
    private readonly logger;
    private genAI;
    constructor();
    extractTextFromImage(imageBuffer: Buffer): Promise<{
        text: string;
        confidence: number;
        data: any;
    }>;
    private generateInvoiceSummary;
}
