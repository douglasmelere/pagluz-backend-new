import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const BUCKET_NAME = 'avatares-perfil';

@Injectable()
export class AvatarStorageService {
  private readonly supabase: SupabaseClient;
  private readonly logger = new Logger(AvatarStorageService.name);

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Faz upload de uma foto de perfil para o Supabase Storage.
   * O arquivo é salvo na pasta correspondente ao tipo de entidade (users/ ou representatives/).
   * @param file Arquivo de imagem (Express.Multer.File)
   * @param entityType 'users' ou 'representatives'
   * @param entityId ID da entidade (usuário ou representante)
   * @returns URL pública da foto de perfil
   */
  async uploadAvatar(
    file: Express.Multer.File,
    entityType: 'users' | 'representatives',
    entityId: string,
  ): Promise<string> {
    this.validateFile(file);

    // Determina a extensão do arquivo
    const extension = this.getExtensionFromMime(file.mimetype);
    // O nome do arquivo é sempre o ID da entidade para facilitar substituição
    const fileName = `${entityId}${extension}`;
    const filePath = `${entityType}/${fileName}`;

    const { error } = await this.supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true, // Sobrescreve foto anterior automaticamente
      });

    if (error) {
      this.logger.error(`Erro ao fazer upload de avatar: ${error.message}`);
      throw new BadRequestException(`Erro ao fazer upload da foto: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    this.logger.log(`Avatar uploaded para ${filePath}`);
    return publicUrl;
  }

  /**
   * Remove a foto de perfil de uma entidade do Supabase Storage.
   * Tenta remover todas as extensões possíveis já que não sabemos qual foi usada.
   * @param entityType 'users' ou 'representatives'
   * @param entityId ID da entidade
   */
  async deleteAvatar(
    entityType: 'users' | 'representatives',
    entityId: string,
  ): Promise<void> {
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const filePaths = extensions.map(ext => `${entityType}/${entityId}${ext}`);

    // Remove todas as extensões possíveis (ignora erros pois alguns caminhos podem não existir)
    const { error } = await this.supabase.storage.from(BUCKET_NAME).remove(filePaths);

    if (error) {
      this.logger.warn(`Aviso ao remover avatar (pode não existir): ${error.message}`);
    } else {
      this.logger.log(`Avatar removido para ${entityType}/${entityId}`);
    }
  }

  /**
   * Valida o arquivo de imagem (tipo MIME e tamanho).
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de arquivo não permitido: ${file.mimetype}. Tipos aceitos: JPEG, PNG, WebP`,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Limite: 5MB`,
      );
    }
  }

  /**
   * Retorna a extensão de arquivo baseada no tipo MIME.
   */
  private getExtensionFromMime(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    return map[mimetype] || '.jpg';
  }
}
