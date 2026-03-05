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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommercialMaterialsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const prisma_service_1 = require("../../config/prisma.service");
const push_notification_service_1 = require("../push-notifications/push-notification.service");
let CommercialMaterialsService = class CommercialMaterialsService {
    prisma;
    configService;
    pushNotificationService;
    supabase;
    BUCKET_NAME = 'materiais-comerciais';
    constructor(prisma, configService, pushNotificationService) {
        this.prisma = prisma;
        this.configService = configService;
        this.pushNotificationService = pushNotificationService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY') ||
            this.configService.get('SUPABASE_ANON_KEY');
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL e chave do Supabase devem estar configuradas no .env');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });
    }
    async create(file, dto) {
        if (!file)
            throw new common_1.BadRequestException('Arquivo é obrigatório.');
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = originalName.split('.').pop()?.toLowerCase() || '';
        const cleanName = originalName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9.\-]/g, '_');
        const uniqueFileName = `${Date.now()}-${cleanName}`;
        const { error } = await this.supabase.storage
            .from(this.BUCKET_NAME)
            .upload(uniqueFileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error)
            throw new common_1.BadRequestException(`Erro ao enviar arquivo: ${error.message}`);
        const { data: publicData } = this.supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(uniqueFileName);
        const material = await this.prisma.commercialMaterial.create({
            data: {
                title: dto.title,
                description: dto.description,
                category: dto.category,
                fileUrl: publicData.publicUrl,
                fileName: originalName,
                fileType: file.mimetype,
                fileSize: file.size,
            },
        });
        await this.pushNotificationService.sendToAll({
            title: 'Novo Material Comercial! 📁',
            body: `O material "${dto.title}" acabou de ser adicionado e já está disponível para você.`
        });
        return material;
    }
    async findAll(onlyActive = false) {
        return this.prisma.commercialMaterial.findMany({
            where: onlyActive ? { isActive: true } : undefined,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const material = await this.prisma.commercialMaterial.findUnique({ where: { id } });
        if (!material)
            throw new common_1.NotFoundException('Material não encontrado.');
        return material;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.commercialMaterial.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        const material = await this.findOne(id);
        const fileName = material.fileUrl.split('/').pop();
        if (fileName) {
            await this.supabase.storage.from(this.BUCKET_NAME).remove([fileName]);
        }
        return this.prisma.commercialMaterial.delete({ where: { id } });
    }
    async getDownloadUrl(id) {
        const material = await this.findOne(id);
        if (!material.isActive)
            throw new common_1.BadRequestException('Material não está disponível.');
        const fileName = material.fileUrl.split('/').pop();
        const { data, error } = await this.supabase.storage
            .from(this.BUCKET_NAME)
            .createSignedUrl(fileName, 3600);
        if (error)
            throw new common_1.NotFoundException('Arquivo não encontrado no storage.');
        return { url: data.signedUrl, fileName: material.fileName };
    }
};
exports.CommercialMaterialsService = CommercialMaterialsService;
exports.CommercialMaterialsService = CommercialMaterialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        push_notification_service_1.PushNotificationService])
], CommercialMaterialsService);
//# sourceMappingURL=commercial-materials.service.js.map