import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly webhookUrl = 'https://automation.pagluz.com.br/webhook/send-notification';

  constructor(private configService: ConfigService) { }

  /**
   * Envia uma notificação para o webhook da Pagluz
   * @param type Tipo da notificação (NOVO_CLIENTE, ALTERACAO_SOLICITADA, PROPOSTA_SOLICITADA)
   * @param data Dados relevantes para a notificação
   */
  async sendNotification(type: 'NOVO_CLIENTE' | 'ALTERACAO_SOLICITADA' | 'PROPOSTA_SOLICITADA', data: any) {
    try {
      const payload = {
        event: type,
        timestamp: new Date().toISOString(),
        data,
      };

      this.logger.log(`Enviando notificação de webhook: ${type}`);

      await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Webhook enviado com sucesso: ${type}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar webhook (${type}): ${error.message}`);
      // Não lançamos erro para não quebrar o fluxo principal da aplicação
    }
  }
}
