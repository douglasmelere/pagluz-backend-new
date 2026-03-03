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
var AvatarStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const BUCKET_NAME = 'avatares-perfil';
let AvatarStorageService = AvatarStorageService_1 = class AvatarStorageService {
    configService;
    supabase;
    logger = new common_1.Logger(AvatarStorageService_1.name);
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY') ||
            this.configService.get('SUPABASE_ANON_KEY');
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados no .env');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    async uploadAvatar(file, entityType, entityId) {
        this.validateFile(file);
        const extension = this.getExtensionFromMime(file.mimetype);
        const fileName = `${entityId}${extension}`;
        const filePath = `${entityType}/${fileName}`;
        const { error } = await this.supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });
        if (error) {
            this.logger.error(`Erro ao fazer upload de avatar: ${error.message}`);
            throw new common_1.BadRequestException(`Erro ao fazer upload da foto: ${error.message}`);
        }
        const { data: { publicUrl }, } = this.supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        this.logger.log(`Avatar uploaded para ${filePath}`);
        return publicUrl;
    }
    async deleteAvatar(entityType, entityId) {
        const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const filePaths = extensions.map(ext => `${entityType}/${entityId}${ext}`);
        const { error } = await this.supabase.storage.from(BUCKET_NAME).remove(filePaths);
        if (error) {
            this.logger.warn(`Aviso ao remover avatar (pode não existir): ${error.message}`);
        }
        else {
            this.logger.log(`Avatar removido para ${entityType}/${entityId}`);
        }
    }
    validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('Nenhum arquivo foi enviado');
        }
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Tipo de arquivo não permitido: ${file.mimetype}. Tipos aceitos: JPEG, PNG, WebP`);
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new common_1.BadRequestException(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Limite: 5MB`);
        }
    }
    getExtensionFromMime(mimetype) {
        const map = {
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
        };
        return map[mimetype] || '.jpg';
    }
};
exports.AvatarStorageService = AvatarStorageService;
exports.AvatarStorageService = AvatarStorageService = AvatarStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AvatarStorageService);
//# sourceMappingURL=avatar-storage.service.js.map