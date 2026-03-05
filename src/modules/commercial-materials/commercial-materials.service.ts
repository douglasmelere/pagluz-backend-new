import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../config/prisma.service';
import { CreateCommercialMaterialDto } from './dto/create-commercial-material.dto';
import { UpdateCommercialMaterialDto } from './dto/update-commercial-material.dto';
import { PushNotificationService } from '../push-notifications/push-notification.service';

@Injectable()
export class CommercialMaterialsService {
  private supabase: SupabaseClient;
  private readonly BUCKET_NAME = 'materiais-comerciais';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private pushNotificationService: PushNotificationService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
      this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL e chave do Supabase devem estar configuradas no .env');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  // ─── Admin: Upload de material ───────────────────────────────────────────────

  async create(
    file: Express.Multer.File,
    dto: CreateCommercialMaterialDto,
  ) {
    if (!file) throw new BadRequestException('Arquivo é obrigatório.');

    // O multer decodifica headers multipart como latin1 por padrão. Convertendo para utf8:
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const ext = originalName.split('.').pop()?.toLowerCase() || '';
    const cleanName = originalName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9.\-]/g, '_'); // Substitui caracteres especiais por underline

    const uniqueFileName = `${Date.now()}-${cleanName}`;

    const { error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .upload(uniqueFileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new BadRequestException(`Erro ao enviar arquivo: ${error.message}`);

    const { data: publicData } = this.supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(uniqueFileName);

    const material = await this.prisma.commercialMaterial.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        fileUrl: publicData.publicUrl,
        fileName: originalName, // Salva o nome decodificado (com acentos bonitinhos)
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });

    // Notificar todos os representantes sobre o novo material
    await this.pushNotificationService.sendToAll({
      title: 'Novo Material Comercial! 📁',
      body: `O material "${dto.title}" acabou de ser adicionado e já está disponível para você.`
    });

    return material;
  }

  // ─── Admin + Representante: Listar materiais ativos ──────────────────────────

  async findAll(onlyActive = false) {
    return this.prisma.commercialMaterial.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const material = await this.prisma.commercialMaterial.findUnique({ where: { id } });
    if (!material) throw new NotFoundException('Material não encontrado.');
    return material;
  }

  // ─── Admin: Atualizar metadados ───────────────────────────────────────────────

  async update(id: string, dto: UpdateCommercialMaterialDto) {
    await this.findOne(id);
    return this.prisma.commercialMaterial.update({
      where: { id },
      data: dto,
    });
  }

  // ─── Admin: Excluir material ──────────────────────────────────────────────────

  async remove(id: string) {
    const material = await this.findOne(id);

    // Extrai nome do arquivo da URL e deleta do Supabase Storage
    const fileName = material.fileUrl.split('/').pop();
    if (fileName) {
      await this.supabase.storage.from(this.BUCKET_NAME).remove([fileName]);
    }

    return this.prisma.commercialMaterial.delete({ where: { id } });
  }

  // ─── Download / URL de acesso ─────────────────────────────────────────────────

  async getDownloadUrl(id: string) {
    const material = await this.findOne(id);
    if (!material.isActive) throw new BadRequestException('Material não está disponível.');
    // Cria uma URL assinada com validade de 1 hora para download seguro
    const fileName = material.fileUrl.split('/').pop()!;
    const { data, error } = await this.supabase.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(fileName, 3600);

    if (error) throw new NotFoundException('Arquivo não encontrado no storage.');
    return { url: data.signedUrl, fileName: material.fileName };
  }
}
