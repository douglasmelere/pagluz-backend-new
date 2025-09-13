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
exports.CreateGeneratorDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateGeneratorDto {
    ownerName;
    cpfCnpj;
    sourceType;
    installedPower;
    concessionaire;
    ucNumber;
    city;
    state;
    status;
    observations;
}
exports.CreateGeneratorDto = CreateGeneratorDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome do proprietário ou empresa',
        example: 'Solar Energy Ltda',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGeneratorDto.prototype, "ownerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'CPF ou CNPJ do proprietário',
        example: '12.345.678/0001-90',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGeneratorDto.prototype, "cpfCnpj", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de fonte de energia',
        enum: client_1.SourceType,
        example: client_1.SourceType.SOLAR,
    }),
    (0, class_validator_1.IsEnum)(client_1.SourceType),
    __metadata("design:type", String)
], CreateGeneratorDto.prototype, "sourceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Potência instalada em kWh',
        example: 1500.75,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateGeneratorDto.prototype, "installedPower", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Concessionária de energia',
        example: 'CELESC',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGeneratorDto.prototype, "concessionaire", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número da UC (Unidade Consumidora)',
        example: '87654321',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGeneratorDto.prototype, "ucNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cidade',
        example: 'Florianópolis',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGeneratorDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estado (UF)',
        example: 'SC',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGeneratorDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status do gerador',
        enum: client_1.GeneratorStatus,
        example: client_1.GeneratorStatus.UNDER_ANALYSIS,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(client_1.GeneratorStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGeneratorDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Observações adicionais',
        example: 'Instalação concluída em dezembro de 2023',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGeneratorDto.prototype, "observations", void 0);
//# sourceMappingURL=create-generator.dto.js.map