"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GoogleApisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleApisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const nodemailer = require("nodemailer");
let GoogleApisService = GoogleApisService_1 = class GoogleApisService {
    configService;
    logger = new common_1.Logger(GoogleApisService_1.name);
    auth;
    drive;
    sheets;
    docs;
    gmail;
    transporter;
    constructor(configService) {
        this.configService = configService;
        this.initializeAuth();
        this.initializeGmail();
    }
    initializeAuth() {
        try {
            const credentials = this.configService.get('GOOGLE_CREDENTIALS');
            if (!credentials) {
                this.logger.warn('GOOGLE_CREDENTIALS não configurado. Funcionalidades do Google serão desabilitadas.');
                return;
            }
            const credentialsJson = typeof credentials === 'string' ? JSON.parse(credentials) : credentials;
            this.auth = new googleapis_1.google.auth.GoogleAuth({
                credentials: credentialsJson,
                scopes: [
                    'https://www.googleapis.com/auth/drive',
                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/documents',
                    'https://www.googleapis.com/auth/gmail.send',
                ],
            });
            this.drive = googleapis_1.google.drive({ version: 'v3', auth: this.auth });
            this.sheets = googleapis_1.google.sheets({ version: 'v4', auth: this.auth });
            this.docs = googleapis_1.google.docs({ version: 'v1', auth: this.auth });
        }
        catch (error) {
            this.logger.error('Erro ao inicializar Google APIs:', error);
        }
    }
    initializeGmail() {
        try {
            const gmailUser = this.configService.get('GMAIL_USER');
            const gmailPassword = this.configService.get('GMAIL_APP_PASSWORD');
            if (gmailUser && gmailPassword) {
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: gmailUser,
                        pass: gmailPassword,
                    },
                });
            }
        }
        catch (error) {
            this.logger.warn('Gmail não configurado, emails não serão enviados:', error);
        }
    }
    async createFolder(name, parentFolderId) {
        if (!this.drive) {
            throw new Error('Google Drive não está configurado. Configure GOOGLE_CREDENTIALS no .env');
        }
        try {
            const fileMetadata = {
                name,
                mimeType: 'application/vnd.google-apps.folder',
            };
            if (parentFolderId) {
                fileMetadata.parents = [parentFolderId];
            }
            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });
            return response.data.id;
        }
        catch (error) {
            this.logger.error(`Erro ao criar pasta ${name}:`, error);
            throw error;
        }
    }
    async copyFile(fileId, name, folderId) {
        if (!this.drive) {
            throw new Error('Google Drive não está configurado. Configure GOOGLE_CREDENTIALS no .env');
        }
        try {
            const fileMetadata = {
                name,
            };
            if (folderId) {
                fileMetadata.parents = [folderId];
            }
            const response = await this.drive.files.copy({
                fileId,
                requestBody: fileMetadata,
                fields: 'id',
            });
            return response.data.id;
        }
        catch (error) {
            this.logger.error(`Erro ao copiar arquivo ${fileId}:`, error);
            throw error;
        }
    }
    async updateDocument(documentId, replacements) {
        if (!this.docs) {
            throw new Error('Google Docs não está configurado. Configure GOOGLE_CREDENTIALS no .env');
        }
        try {
            const requests = Object.entries(replacements).map(([find, replace]) => ({
                replaceAllText: {
                    containsText: {
                        text: find,
                        matchCase: false,
                    },
                    replaceText: replace,
                },
            }));
            await this.docs.documents.batchUpdate({
                documentId,
                requestBody: {
                    requests,
                },
            });
        }
        catch (error) {
            this.logger.error(`Erro ao atualizar documento ${documentId}:`, error);
            throw error;
        }
    }
    async downloadAsPdf(fileId) {
        if (!this.drive) {
            throw new Error('Google Drive não está configurado. Configure GOOGLE_CREDENTIALS no .env');
        }
        try {
            const response = await this.drive.files.export({
                fileId,
                mimeType: 'application/pdf',
            }, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        }
        catch (error) {
            this.logger.error(`Erro ao baixar PDF ${fileId}:`, error);
            throw error;
        }
    }
    async appendRow(spreadsheetId, sheetName, values) {
        if (!this.sheets) {
            throw new Error('Google Sheets não está configurado. Configure GOOGLE_CREDENTIALS no .env');
        }
        try {
            const headerResponse = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!1:1`,
            });
            const headers = headerResponse.data.values?.[0] || [];
            const row = headers.map((header) => values[header] || '');
            await this.sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A:A`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [row],
                },
            });
        }
        catch (error) {
            this.logger.error(`Erro ao adicionar linha na planilha:`, error);
            throw error;
        }
    }
    async sendEmail(to, subject, text, attachment) {
        if (!this.transporter) {
            this.logger.warn('Gmail não configurado, email não enviado');
            return;
        }
        try {
            const mailOptions = {
                from: this.configService.get('GMAIL_USER'),
                to,
                subject,
                text,
            };
            if (attachment) {
                mailOptions.attachments = [
                    {
                        filename: attachment.filename,
                        content: attachment.content,
                    },
                ];
            }
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email enviado para ${to}`);
        }
        catch (error) {
            this.logger.error(`Erro ao enviar email:`, error);
            throw error;
        }
    }
};
exports.GoogleApisService = GoogleApisService;
exports.GoogleApisService = GoogleApisService = GoogleApisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GoogleApisService);
//# sourceMappingURL=google-apis.service.js.map