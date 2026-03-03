"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberToWordsService = void 0;
const common_1 = require("@nestjs/common");
const numero_por_extenso_1 = require("numero-por-extenso");
let NumberToWordsService = class NumberToWordsService {
    toWords(number) {
        const num = typeof number === 'string' ? parseFloat(number) : number;
        if (isNaN(num) || num === 0) {
            return 'zero';
        }
        try {
            return (0, numero_por_extenso_1.numeroPorExtenso)(num, numero_por_extenso_1.numeroPorExtenso.estilo.monetario);
        }
        catch (error) {
            return (0, numero_por_extenso_1.numeroPorExtenso)(num);
        }
    }
    toWordsSimple(number) {
        const num = typeof number === 'string' ? parseFloat(number) : number;
        if (isNaN(num) || num === 0) {
            return 'zero';
        }
        try {
            return (0, numero_por_extenso_1.numeroPorExtenso)(num);
        }
        catch (error) {
            return String(num);
        }
    }
};
exports.NumberToWordsService = NumberToWordsService;
exports.NumberToWordsService = NumberToWordsService = __decorate([
    (0, common_1.Injectable)()
], NumberToWordsService);
//# sourceMappingURL=number-to-words.service.js.map