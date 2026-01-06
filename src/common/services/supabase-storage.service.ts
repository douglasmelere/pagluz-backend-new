import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient;
  private bucketName = 'faturas-representantes';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    // Usa SERVICE_ROLE_KEY para operações administrativas (ignora RLS)
    // Se não existir, tenta usar ANON_KEY como fallback
    const supabaseKey = 
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_ANON_KEY) devem estar configurados no .env'
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Faz upload de um arquivo para o bucket do Supabase
   * @param file Arquivo a ser enviado (Buffer ou File)
   * @param fileName Nome do arquivo
   * @param folder Pasta dentro do bucket (opcional)
   * @returns URL pública do arquivo
   */
  async uploadFile(
    file: Express.Multer.File,
    fileName: string,
    folder?: string,
  ): Promise<{ url: string; path: string }> {
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    const fileBuffer = file.buffer;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: true, // Substitui arquivo se já existir
      });

    if (error) {
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    // Obtém URL pública
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.bucketName).getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
    };
  }

  /**
   * Remove um arquivo do bucket
   * @param filePath Caminho do arquivo no bucket
   */
  async deleteFile(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Erro ao deletar arquivo: ${error.message}`);
    }
  }

  /**
   * Obtém URL pública de um arquivo
   * @param filePath Caminho do arquivo no bucket
   * @returns URL pública
   */
  getPublicUrl(filePath: string): string {
    const {
      data: { publicUrl },
    } = this.supabase.storage.from(this.bucketName).getPublicUrl(filePath);

    return publicUrl;
  }

  /**
   * Gera uma URL assinada (signed URL) para download temporário
   * @param filePath Caminho do arquivo no bucket
   * @param expiresIn Tempo de expiração em segundos (padrão: 1 hora)
   * @returns URL assinada
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Erro ao gerar URL assinada: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Faz download de um arquivo do bucket
   * @param filePath Caminho do arquivo no bucket
   * @returns Buffer do arquivo
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .download(filePath);

    if (error) {
      throw new Error(`Erro ao fazer download: ${error.message}`);
    }

    // Converte Blob para Buffer
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}


