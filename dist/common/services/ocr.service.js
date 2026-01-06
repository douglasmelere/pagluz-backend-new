"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OcrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrService = void 0;
const common_1 = require("@nestjs/common");
const tesseract_js_1 = require("tesseract.js");
let OcrService = OcrService_1 = class OcrService {
    logger = new common_1.Logger(OcrService_1.name);
    worker = null;
    async initializeWorker() {
        if (!this.worker) {
            this.worker = await (0, tesseract_js_1.createWorker)('por', 1, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        this.logger.debug(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                },
            });
        }
        return this.worker;
    }
    async extractTextFromImage(imageBuffer) {
        try {
            const worker = await this.initializeWorker();
            this.logger.log('Iniciando extração de texto da fatura...');
            const { data: { text, confidence }, } = await worker.recognize(imageBuffer);
            this.logger.log(`Texto extraído com confiança de ${confidence}%`);
            const structuredData = this.parseInvoiceData(text);
            return {
                text,
                confidence,
                data: structuredData,
            };
        }
        catch (error) {
            this.logger.error(`Erro ao processar OCR: ${error.message}`);
            throw error;
        }
    }
    parseInvoiceData(text) {
        const data = {};
        const ucMatch = text.match(/UC[:\s]*(\d+)/i) || text.match(/(\d{8,})/);
        if (ucMatch) {
            data.ucNumber = ucMatch[1];
        }
        const consumptionMatch = text.match(/(\d+[.,]?\d*)\s*kWh/i);
        if (consumptionMatch) {
            data.consumption = parseFloat(consumptionMatch[1].replace(',', '.'));
        }
        const valueMatch = text.match(/R\$\s*(\d+[.,]?\d*)/i);
        if (valueMatch) {
            data.value = parseFloat(valueMatch[1].replace(',', '.'));
        }
        const dateMatch = text.match(/(vencimento|venc\.?)[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
        if (dateMatch) {
            data.dueDate = dateMatch[2];
        }
        return data;
    }
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
    }
};
exports.OcrService = OcrService;
exports.OcrService = OcrService = OcrService_1 = __decorate([
    (0, common_1.Injectable)()
], OcrService);
//# sourceMappingURL=ocr.service.js.map