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
exports.PaymentProofStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let PaymentProofStorageService = class PaymentProofStorageService {
    configService;
    supabase;
    bucketName = 'comprovantes-pagamento';
    bucketExistsCache = null;
    bucketCheckTime = 0;
    BUCKET_CACHE_TTL = 300000;
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY') ||
            this.configService.get('SUPABASE_ANON_KEY');
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (ou SUPABASE_ANON_KEY) devem estar configurados no .env');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    async onModuleInit() {
        try {
            const exists = await this.bucketExists();
            if (!exists) {
                console.warn(`⚠️ ATENÇÃO: Bucket '${this.bucketName}' não foi encontrado!`);
                console.warn('Execute o script de setup: npm run setup:payment-proof-storage');
            }
            else {
                console.log(`✅ Bucket '${this.bucketName}' verificado com sucesso!`);
            }
        }
        catch (error) {
            console.error(`❌ Erro ao verificar bucket: ${error.message}`);
        }
    }
    async uploadPaymentProof(file, fileName, commissionId) {
        const filePath = `${commissionId}/${fileName}`;
        const fileBuffer = file.buffer;
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(filePath, fileBuffer, {
            contentType: file.mimetype,
            upsert: true,
        });
        if (error) {
            throw new Error(`Erro ao fazer upload do comprovante: ${error.message}`);
        }
        const { data: { publicUrl }, } = this.supabase.storage.from(this.bucketName).getPublicUrl(filePath);
        return {
            url: publicUrl,
            path: filePath,
        };
    }
    async deletePaymentProof(filePath) {
        const { error } = await this.supabase.storage
            .from(this.bucketName)
            .remove([filePath]);
        if (error) {
            throw new Error(`Erro ao deletar comprovante: ${error.message}`);
        }
    }
    getPublicUrl(filePath) {
        const { data: { publicUrl }, } = this.supabase.storage.from(this.bucketName).getPublicUrl(filePath);
        return publicUrl;
    }
    async getSignedUrl(filePath, expiresIn = 3600) {
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .createSignedUrl(filePath, expiresIn);
        if (error) {
            throw new Error(`Erro ao gerar URL assinada: ${error.message}`);
        }
        return data.signedUrl;
    }
    async bucketExists() {
        try {
            const now = Date.now();
            if (this.bucketExistsCache !== null && (now - this.bucketCheckTime) < this.BUCKET_CACHE_TTL) {
                return this.bucketExistsCache;
            }
            const { data, error } = await this.supabase.storage.listBuckets();
            if (error) {
                console.error('Erro ao listar buckets:', error);
                return this.bucketExistsCache || false;
            }
            const exists = data?.some(bucket => bucket.name === this.bucketName) || false;
            this.bucketExistsCache = exists;
            this.bucketCheckTime = now;
            return exists;
        }
        catch (error) {
            console.error('Erro ao verificar bucket:', error);
            return this.bucketExistsCache || false;
        }
    }
    async downloadPaymentProof(filePath) {
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
            const arrayBuffer = await data.arrayBuffer();
            return Buffer.from(arrayBuffer);
        }
        catch (error) {
            if (error.message) {
                throw error;
            }
            throw new Error(`Erro ao fazer download do comprovante: ${error.message || 'Erro desconhecido'}`);
        }
    }
};
exports.PaymentProofStorageService = PaymentProofStorageService;
exports.PaymentProofStorageService = PaymentProofStorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaymentProofStorageService);
//# sourceMappingURL=payment-proof-storage.service.js.map