import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';

@Injectable()
export class GoogleApisService {
  private readonly logger = new Logger(GoogleApisService.name);
  private auth: any;
  private drive: any;
  private sheets: any;
  private docs: any;
  private gmail: any;
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeAuth();
    this.initializeGmail();
  }

  private initializeAuth() {
    try {
      // Carrega credenciais do Google do .env
      const credentials = this.configService.get<string>('GOOGLE_CREDENTIALS');
      if (!credentials) {
        this.logger.warn('GOOGLE_CREDENTIALS não configurado. Funcionalidades do Google serão desabilitadas.');
        return;
      }

      const credentialsJson = typeof credentials === 'string' ? JSON.parse(credentials) : credentials;
      
      this.auth = new google.auth.GoogleAuth({
        credentials: credentialsJson,
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/documents',
          'https://www.googleapis.com/auth/gmail.send',
        ],
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.docs = google.docs({ version: 'v1', auth: this.auth });
    } catch (error) {
      this.logger.error('Erro ao inicializar Google APIs:', error);
      // Não lança erro para não quebrar a aplicação se Google não estiver configurado
    }
  }

  private initializeGmail() {
    try {
      const gmailUser = this.configService.get<string>('GMAIL_USER');
      const gmailPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');

      if (gmailUser && gmailPassword) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPassword,
          },
        });
      }
    } catch (error) {
      this.logger.warn('Gmail não configurado, emails não serão enviados:', error);
    }
  }

  /**
   * Cria uma pasta no Google Drive
   */
  async createFolder(name: string, parentFolderId?: string): Promise<string> {
    if (!this.drive) {
      throw new Error('Google Drive não está configurado. Configure GOOGLE_CREDENTIALS no .env');
    }

    try {
      const fileMetadata: any = {
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
    } catch (error) {
      this.logger.error(`Erro ao criar pasta ${name}:`, error);
      throw error;
    }
  }

  /**
   * Copia um arquivo do Google Drive
   */
  async copyFile(
    fileId: string,
    name: string,
    folderId?: string,
  ): Promise<string> {
    if (!this.drive) {
      throw new Error('Google Drive não está configurado. Configure GOOGLE_CREDENTIALS no .env');
    }

    try {
      const fileMetadata: any = {
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
    } catch (error) {
      this.logger.error(`Erro ao copiar arquivo ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza um documento do Google Docs com substituições de texto
   */
  async updateDocument(
    documentId: string,
    replacements: { [key: string]: string },
  ): Promise<void> {
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
    } catch (error) {
      this.logger.error(`Erro ao atualizar documento ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Baixa um arquivo do Google Drive como PDF
   */
  async downloadAsPdf(fileId: string): Promise<Buffer> {
    if (!this.drive) {
      throw new Error('Google Drive não está configurado. Configure GOOGLE_CREDENTIALS no .env');
    }

    try {
      const response = await this.drive.files.export(
        {
          fileId,
          mimeType: 'application/pdf',
        },
        { responseType: 'arraybuffer' },
      );

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      this.logger.error(`Erro ao baixar PDF ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Adiciona uma linha em uma planilha do Google Sheets
   */
  async appendRow(
    spreadsheetId: string,
    sheetName: string,
    values: { [key: string]: any },
  ): Promise<void> {
    if (!this.sheets) {
      throw new Error('Google Sheets não está configurado. Configure GOOGLE_CREDENTIALS no .env');
    }

    try {
      // Primeiro, obtém os cabeçalhos da planilha
      const headerResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!1:1`,
      });

      const headers = headerResponse.data.values?.[0] || [];
      
      // Mapeia os valores para a ordem dos cabeçalhos
      const row = headers.map((header: string) => values[header] || '');

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [row],
        },
      });
    } catch (error) {
      this.logger.error(`Erro ao adicionar linha na planilha:`, error);
      throw error;
    }
  }

  /**
   * Envia email com anexo
   */
  async sendEmail(
    to: string,
    subject: string,
    text: string,
    attachment?: { filename: string; content: Buffer },
  ): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Gmail não configurado, email não enviado');
      return;
    }

    try {
      const mailOptions: any = {
        from: this.configService.get<string>('GMAIL_USER'),
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
    } catch (error) {
      this.logger.error(`Erro ao enviar email:`, error);
      throw error;
    }
  }
}

