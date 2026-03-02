import { ConfigService } from '@nestjs/config';
export declare class WebhookService {
    private configService;
    private readonly logger;
    private readonly webhookUrl;
    constructor(configService: ConfigService);
    sendNotification(type: 'NOVO_CLIENTE' | 'ALTERACAO_SOLICITADA' | 'PROPOSTA_SOLICITADA', data: any): Promise<void>;
}
