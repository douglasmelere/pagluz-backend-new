import { ConfigService } from '@nestjs/config';
export declare class GoogleApisService {
    private configService;
    private readonly logger;
    private auth;
    private drive;
    private sheets;
    private docs;
    private gmail;
    private transporter;
    constructor(configService: ConfigService);
    private initializeAuth;
    private initializeGmail;
    createFolder(name: string, parentFolderId?: string): Promise<string>;
    copyFile(fileId: string, name: string, folderId?: string): Promise<string>;
    updateDocument(documentId: string, replacements: {
        [key: string]: string;
    }): Promise<void>;
    downloadAsPdf(fileId: string): Promise<Buffer>;
    appendRow(spreadsheetId: string, sheetName: string, values: {
        [key: string]: any;
    }): Promise<void>;
    sendEmail(to: string, subject: string, text: string, attachment?: {
        filename: string;
        content: Buffer;
    }): Promise<void>;
}
