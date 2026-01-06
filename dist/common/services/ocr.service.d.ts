export declare class OcrService {
    private readonly logger;
    private worker;
    private initializeWorker;
    extractTextFromImage(imageBuffer: Buffer): Promise<{
        text: string;
        confidence: number;
        data: any;
    }>;
    private parseInvoiceData;
    terminate(): Promise<void>;
}
