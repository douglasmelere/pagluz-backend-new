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
exports.CreateFeedbackDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateFeedbackDto {
    type;
    subject;
    description;
    category;
    attachmentUrl;
    attachmentFileName;
}
exports.CreateFeedbackDto = CreateFeedbackDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo do feedback',
        enum: ['COMPLAINT', 'SUGGESTION', 'BUG', 'PRAISE'],
        example: 'SUGGESTION',
    }),
    (0, class_validator_1.IsEnum)(['COMPLAINT', 'SUGGESTION', 'BUG', 'PRAISE']),
    __metadata("design:type", String)
], CreateFeedbackDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Assunto / Título curto',
        example: 'Melhoria na tela de alocação',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5, { message: 'O assunto deve ter no mínimo 5 caracteres' }),
    (0, class_validator_1.MaxLength)(150, { message: 'O assunto deve ter no máximo 150 caracteres' }),
    __metadata("design:type", String)
], CreateFeedbackDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Descrição detalhada do feedback',
        example: 'Seria muito útil ter um filtro por data na tela de alocação dos consumidores.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, { message: 'A descrição deve ter no mínimo 10 caracteres' }),
    __metadata("design:type", String)
], CreateFeedbackDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Categoria (ex: Dashboard, Comissões, Alocação, Geral)',
        example: 'Alocação',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFeedbackDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL do anexo (screenshot, documento)',
        example: 'https://supabase.pagluz.com.br/storage/v1/object/public/feedbacks/screenshot.png',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFeedbackDto.prototype, "attachmentUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nome do arquivo anexo',
        example: 'screenshot.png',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFeedbackDto.prototype, "attachmentFileName", void 0);
//# sourceMappingURL=create-feedback.dto.js.map