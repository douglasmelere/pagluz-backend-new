import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class PaymentProofStorageService implements OnModuleInit {
  private supabase: SupabaseClient;
  private bucketName = 'comprovantes-pagamento';
  private bucketExistsCache: boolean | null = null;
  private bucketCheckTime: number = 0;
  private readonly BUCKET_CACHE_TTL = 300000; // 5 minutos

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
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
   * Verifica o bucket na inicialização do módulo
   */
  async onModuleInit() {
    try {
      const exists = await this.bucketExists();
      if (!exists) {
        console.warn(`⚠️ ATENÇÃO: Bucket '${this.bucketName}' não foi encontrado!`);
        console.warn('Execute o script de setup: npm run setup:payment-proof-storage');
      } else {
        console.log(`✅ Bucket '${this.bucketName}' verificado com sucesso!`);
      }
    } catch (error: any) {
      console.error(`❌ Erro ao verificar bucket: ${error.message}`);
    }
  }

  /**
   * Faz upload de um comprovante de pagamento para o bucket do Supabase
   * @param file Arquivo a ser enviado (Buffer ou File)
   * @param fileName Nome do arquivo
   * @param commissionId ID da comissão (usado para organizar em pastas)
   * @returns URL pública do arquivo e path
   */
  async uploadPaymentProof(
    file: Express.Multer.File,
    fileName: string,
    commissionId: string,
  ): Promise<{ url: string; path: string }> {
    // Organiza por comissão para facilitar gestão
    const filePath = `${commissionId}/${fileName}`;
    const fileBuffer = file.buffer;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: true, // Substitui arquivo se já existir
      });

    if (error) {
      throw new Error(`Erro ao fazer upload do comprovante: ${error.message}`);
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
   * Remove um comprovante do bucket
   * @param filePath Caminho do arquivo no bucket
   */
  async deletePaymentProof(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Erro ao deletar comprovante: ${error.message}`);
    }
  }

  /**
   * Obtém URL pública de um comprovante
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
   * Verifica se o bucket existe (com cache para melhor performance)
   * @returns true se o bucket existe, false caso contrário
   */
  async bucketExists(): Promise<boolean> {
    try {
      // Retorna cache se ainda estiver válido
      const now = Date.now();
      if (this.bucketExistsCache !== null && (now - this.bucketCheckTime) < this.BUCKET_CACHE_TTL) {
        return this.bucketExistsCache;
      }

      // Verifica bucket
      const { data, error } = await this.supabase.storage.listBuckets();
      if (error) {
        console.error('Erro ao listar buckets:', error);
        return this.bucketExistsCache || false;
      }

      const exists = data?.some(bucket => bucket.name === this.bucketName) || false;

      // Atualiza cache
      this.bucketExistsCache = exists;
      this.bucketCheckTime = now;

      return exists;
    } catch (error) {
      console.error('Erro ao verificar bucket:', error);
      return this.bucketExistsCache || false;
    }
  }

  /**
   * Faz download de um comprovante do bucket
   * @param filePath Caminho do arquivo no bucket
   * @returns Buffer do arquivo
   */
  async downloadPaymentProof(filePath: string): Promise<Buffer> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .download(filePath);

      if (error) {
        if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
          this.bucketExistsCache = false;
          this.bucketCheckTime = Date.now();
          throw new Error(`Bucket '${this.bucketName}' não encontrado no Supabase. Execute 'npm run setup:payment-proof-storage' para criar o bucket.`);
        }
        if (error.message?.includes('Object not found') || error.message?.includes('404')) {
          throw new Error(`Comprovante não encontrado no caminho: ${filePath}`);
        }
        throw new Error(`Erro ao fazer download: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Comprovante não encontrado no caminho: ${filePath}`);
      }

      // Converte Blob para Buffer
      const arrayBuffer = await data.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error(`Erro ao fazer download do comprovante: ${error.message || 'Erro desconhecido'}`);
    }
  }
}
