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
exports.ProposalRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const admin_notifications_service_1 = require("../admin-notifications/admin-notifications.service");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const webhook_service_1 = require("../../common/services/webhook.service");
let ProposalRequestsService = class ProposalRequestsService {
    prisma;
    notificationsService;
    configService;
    webhookService;
    supabase;
    BUCKET_NAME = 'propostas-representantes';
    constructor(prisma, notificationsService, configService, webhookService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
        this.configService = configService;
        this.webhookService = webhookService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY') ||
            this.configService.get('SUPABASE_ANON_KEY');
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL e chave do Supabase devem estar configuradas no .env');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    async create(representativeId, dto) {
        const representative = await this.prisma.representative.findUnique({
            where: { id: representativeId },
            select: { name: true }
        });
        if (!representative)
            throw new common_1.NotFoundException('Representative not found');
        const request = await this.prisma.proposalRequest.create({
            data: {
                ...dto,
                representativeId,
            },
            include: { representative: { select: { name: true } } }
        });
        await this.notificationsService.create({
            title: 'Nova Solicitação de Proposta',
            message: `O representante ${representative.name} solicitou uma proposta para o cliente ${dto.clientName}.`,
        });
        await this.webhookService.sendNotification('PROPOSTA_SOLICITADA', {
            requestId: request.id,
            clientName: dto.clientName,
            representativeName: representative.name,
            invoiceAmount: dto.invoiceAmount,
            kwhValue: dto.kwhValue,
        });
        return request;
    }
    async findAll() {
        return this.prisma.proposalRequest.findMany({
            include: { representative: { select: { name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findByRepresentative(representativeId) {
        return this.prisma.proposalRequest.findMany({
            where: { representativeId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async markAsGenerated(id, file) {
        const request = await this.prisma.proposalRequest.findUnique({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException('Solicitação não encontrada');
        let documentUrl = request.documentUrl;
        let documentFileName = request.documentFileName;
        let documentUploadedAt = request.documentUploadedAt;
        if (file) {
            const ext = file.originalname.split('.').pop()?.toLowerCase();
            const uniqueFileName = `${id}-${Date.now()}.${ext}`;
            const { data, error } = await this.supabase.storage
                .from(this.BUCKET_NAME)
                .upload(uniqueFileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true,
            });
            if (error)
                throw new Error(`Erro ao subir arquivo: ${error.message}`);
            const publicResult = this.supabase.storage.from(this.BUCKET_NAME).getPublicUrl(uniqueFileName);
            documentUrl = publicResult.data.publicUrl;
            documentFileName = file.originalname;
            documentUploadedAt = new Date();
        }
        return this.prisma.proposalRequest.update({
            where: { id },
            data: {
                status: 'GENERATED',
                documentUrl,
                documentFileName,
                documentUploadedAt
            },
            include: { representative: { select: { name: true } } }
        });
    }
    async downloadDocument(id, res, representativeId) {
        const request = await this.prisma.proposalRequest.findUnique({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException('Solicitação não encontrada');
        if (representativeId && request.representativeId !== representativeId) {
            throw new common_1.ForbiddenException('Proposta não pertence a você');
        }
        if (!request.documentUrl) {
            throw new common_1.BadRequestException('A proposta ainda não possui arquivo anexado.');
        }
        const { data, error } = await this.supabase.storage
            .from(this.BUCKET_NAME)
            .download(request.documentUrl.split('/').pop());
        if (error || !data) {
            throw new common_1.NotFoundException('Arquivo não encontrado no Storage');
        }
        const arrayBuffer = await data.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.set({
            'Content-Type': data.type || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${request.documentFileName}"`,
            'Content-Length': buffer.length,
        });
        res.send(buffer);
    }
    async delete(id) {
        return this.prisma.proposalRequest.delete({ where: { id } });
    }
};
exports.ProposalRequestsService = ProposalRequestsService;
exports.ProposalRequestsService = ProposalRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        admin_notifications_service_1.AdminNotificationsService,
        config_1.ConfigService,
        webhook_service_1.WebhookService])
], ProposalRequestsService);
//# sourceMappingURL=proposal-requests.service.js.map