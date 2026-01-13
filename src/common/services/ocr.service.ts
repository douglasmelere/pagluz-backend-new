import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  /**
   * Extrai texto de uma imagem usando OCR
   * @param imageBuffer Buffer da imagem
   * @returns Texto extraído e dados estruturados
   */
  async extractTextFromImage(imageBuffer: Buffer): Promise<{
    text: string;
    confidence: number;
    data: any;
  }> {
    try {
      const worker = await this.initializeWorker();

      this.logger.log("Iniciando extração de texto da fatura...");

      const text = await this.extractTextWithGemini(imageBuffer);
      const confidence = 100; // Assuming confident extraction by Gemini

      this.logger.log(`Texto extraído com confiança de ${confidence}%`);

      // Tenta extrair dados estruturados da fatura
      const structuredData = this.parseInvoiceData(text);

      return {
        text,
        confidence,
        data: structuredData,
      };
    } catch (error) {
      this.logger.error(`Erro ao processar OCR com Gemini: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extrai dados estruturados do texto da fatura
   * @param text Texto extraído do OCR
   * @returns Dados estruturados
   */
  private async extractTextWithGemini(imageBuffer: Buffer): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não está configurado no arquivo .env");
    }

    try {
      const response = await axios.post(
        "https://api.gemini.com/extract",
        imageBuffer,
        {
          headers: {
            "Content-Type": "application/octet-stream",
            Authorization: `Bearer ${apiKey}`,
          },
        },
      );
      return response.data.extracted_text;
    } catch (error) {
      this.logger.error(
        `Erro ao se comunicar com a API do Gemini: ${error.message}`,
      );
      throw new Error("Falha na extração de texto com o Gemini OCR");
    }
  }
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
      data.consumption = parseFloat(consumptionMatch[1].replace(",", "."));
    }

    // Extrai valor (R$)
    const valueMatch = text.match(/R\$\s*(\d+[.,]?\d*)/i);
    if (valueMatch) {
      data.value = parseFloat(valueMatch[1].replace(",", "."));
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
