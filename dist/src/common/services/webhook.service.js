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
var WebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let WebhookService = WebhookService_1 = class WebhookService {
    configService;
    logger = new common_1.Logger(WebhookService_1.name);
    webhookUrl = 'https://automation.pagluz.com.br/webhook/send-notification';
    constructor(configService) {
        this.configService = configService;
    }
    async sendNotification(type, data) {
        try {
            const payload = {
                event: type,
                timestamp: new Date().toISOString(),
                data,
            };
            this.logger.log(`Enviando notificação de webhook: ${type}`);
            await axios_1.default.post(this.webhookUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log(`Webhook enviado com sucesso: ${type}`);
        }
        catch (error) {
            this.logger.error(`Erro ao enviar webhook (${type}): ${error.message}`);
        }
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map