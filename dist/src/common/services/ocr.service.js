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
var OcrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrService = void 0;
const common_1 = require("@nestjs/common");
const generative_ai_1 = require("@google/generative-ai");
let OcrService = OcrService_1 = class OcrService {
    logger = new common_1.Logger(OcrService_1.name);
    genAI;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY não está configurado no arquivo .env");
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async extractTextFromImage(imageBuffer) {
        try {
            this.logger.log("Iniciando extração e análise da fatura com Gemini...");
            const summary = await this.generateInvoiceSummary(imageBuffer);
            this.logger.log("Fatura analisada com sucesso pelo Gemini");
            return {
                text: summary.description,
                confidence: 95,
                data: summary,
            };
        }
        catch (error) {
            this.logger.error(`Erro ao processar fatura com Gemini: ${error.message}`);
            throw error;
        }
    }
    async generateInvoiceSummary(imageBuffer) {
        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const base64Image = imageBuffer.toString("base64");
        const prompt = `Você é um especialista em análise de faturas de energia elétrica CELESC. 
    
Analise a imagem fornecida de uma fatura CELESC e extraia as seguintes informações em JSON:

{
  "ucNumber": "número da UC (Unidade Consumidora)",
  "consumerName": "nome do consumidor",
  "consumerDocument": "CPF/CNPJ do consumidor",
  "serviceType": "tipo de serviço (residencial, comercial, industrial, etc)",
  "referenceMonth": "mês/ano da referência (ex: Janeiro/2025)",
  "consumptionKwh": número de kWh consumido,
  "totalValue": valor total a pagar em R$,
  "dueDate": "data de vencimento (DD/MM/YYYY)",
  "description": "resumo bem estruturado em português com as informações principais",
  "highlights": ["ponto importante 1", "ponto importante 2", "ponto importante 3"]
}

Garanta que:
- Os valores numéricos sejam retornados como números (sem símbolos)
- As datas sejam retornadas no formato DD/MM/YYYY
- Se algo não estiver visível, retorne null para esse campo
- O resumo seja conciso e foque nos dados mais relevantes
- Os highlights destaquem informações importantes ou anomalias`;
        const response = await model.generateContent([
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image,
                },
            },
            prompt,
        ]);
        const responseText = response.response.text();
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Nenhum JSON encontrado na resposta");
            }
            const summaryData = JSON.parse(jsonMatch[0]);
            return {
                ucNumber: summaryData.ucNumber,
                consumerName: summaryData.consumerName,
                consumerDocument: summaryData.consumerDocument,
                serviceType: summaryData.serviceType,
                referenceMonth: summaryData.referenceMonth,
                consumptionKwh: summaryData.consumptionKwh,
                totalValue: summaryData.totalValue,
                dueDate: summaryData.dueDate,
                description: summaryData.description || "",
                highlights: summaryData.highlights || [],
            };
        }
        catch (parseError) {
            this.logger.warn(`Erro ao fazer parse do JSON da resposta Gemini: ${parseError.message}`);
            return {
                description: responseText,
                highlights: [
                    "Analyze efetuada com sucesso",
                    "Verifique os dados manualmente se necessário",
                ],
            };
        }
    }
};
exports.OcrService = OcrService;
exports.OcrService = OcrService = OcrService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], OcrService);
//# sourceMappingURL=ocr.service.js.map