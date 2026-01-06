import { Injectable, Logger } from '@nestjs/common';
import { createWorker, Worker } from 'tesseract.js';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private worker: Worker | null = null;

  /**
   * Inicializa o worker do Tesseract
   */
  private async initializeWorker(): Promise<Worker> {
    if (!this.worker) {
      this.worker = await createWorker('por', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            this.logger.debug(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
    }
    return this.worker;
  }

  /**
   * Extrai texto de uma imagem usando OCR
   * @param imageBuffer Buffer da imagem
   * @returns Texto extraído e dados estruturados
   */
  async extractTextFromImage(
    imageBuffer: Buffer,
  ): Promise<{
    text: string;
    confidence: number;
    data: any;
  }> {
    try {
      const worker = await this.initializeWorker();

      this.logger.log('Iniciando extração de texto da fatura...');

      const {
        data: { text, confidence },
      } = await worker.recognize(imageBuffer);

      this.logger.log(`Texto extraído com confiança de ${confidence}%`);

      // Tenta extrair dados estruturados da fatura
      const structuredData = this.parseInvoiceData(text);

      return {
        text,
        confidence,
        data: structuredData,
      };
    } catch (error) {
      this.logger.error(`Erro ao processar OCR: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extrai dados estruturados do texto da fatura
   * @param text Texto extraído do OCR
   * @returns Dados estruturados
   */
  private parseInvoiceData(text: string): {
    ucNumber?: string;
    consumption?: number;
    value?: number;
    dueDate?: string;
    [key: string]: any;
  } {
    const data: any = {};

    // Extrai número da UC (padrão comum em faturas)
    const ucMatch = text.match(/UC[:\s]*(\d+)/i) || text.match(/(\d{8,})/);
    if (ucMatch) {
      data.ucNumber = ucMatch[1];
    }

    // Extrai consumo (kWh)
    const consumptionMatch = text.match(/(\d+[.,]?\d*)\s*kWh/i);
    if (consumptionMatch) {
      data.consumption = parseFloat(
        consumptionMatch[1].replace(',', '.'),
      );
    }

    // Extrai valor (R$)
    const valueMatch = text.match(/R\$\s*(\d+[.,]?\d*)/i);
    if (valueMatch) {
      data.value = parseFloat(valueMatch[1].replace(',', '.'));
    }

    // Extrai data de vencimento
    const dateMatch = text.match(
      /(vencimento|venc\.?)[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
    );
    if (dateMatch) {
      data.dueDate = dateMatch[2];
    }

    return data;
  }

  /**
   * Limpa recursos do worker
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}








