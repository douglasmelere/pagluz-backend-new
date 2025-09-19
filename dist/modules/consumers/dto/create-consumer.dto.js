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
exports.CreateConsumerDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateConsumerDto {
    name;
    cpfCnpj;
    ucNumber;
    concessionaire;
    city;
    state;
    consumerType;
    phase;
    averageMonthlyConsumption;
    discountOffered;
    status;
    allocatedPercentage;
    generatorId;
    representativeId;
}
exports.CreateConsumerDto = CreateConsumerDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nome do consumidor',
        example: 'João Silva',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateConsumerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'CPF ou CNPJ do consumidor',
        example: '123.456.789-00',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateConsumerDto.prototype, "cpfCnpj", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Número da UC (Unidade Consumidora)',
        example: '12345678',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateConsumerDto.prototype, "ucNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Concessionária de energia',
        example: 'CELESC',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateConsumerDto.prototype, "concessionaire", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cidade',
        example: 'Florianópolis',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateConsumerDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estado (UF)',
        example: 'SC',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateConsumerDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de consumidor',
        enum: client_1.ConsumerType,
        example: client_1.ConsumerType.RESIDENTIAL,
    }),
    (0, class_validator_1.IsEnum)(client_1.ConsumerType),
    __metadata("design:type", String)
], CreateConsumerDto.prototype, "consumerType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tipo de fase',
        enum: client_1.PhaseType,
        example: client_1.PhaseType.MONOPHASIC,
    }),
    (0, class_validator_1.IsEnum)(client_1.PhaseType),
    __metadata("design:type", String)
], CreateConsumerDto.prototype, "phase", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Consumo médio mensal em kWh',
        example: 350.5,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateConsumerDto.prototype, "averageMonthlyConsumption", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Desconto oferecido em porcentagem',
        example: 15.5,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateConsumerDto.prototype, "discountOffered", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status de disponibilidade',
        enum: client_1.ConsumerStatus,
        example: client_1.ConsumerStatus.AVAILABLE,
        required: false,
    }),
    (0, class_validator_1.IsEnum)(client_1.ConsumerStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateConsumerDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Porcentagem de energia alocada',
        example: 80.5,
        required: false,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateConsumerDto.prototype, "allocatedPercentage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do gerador vinculado',
        example: 'clxxx123456',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateConsumerDto.prototype, "generatorId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do representante que está cadastrando',
        example: 'clxxx123456',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateConsumerDto.prototype, "representativeId", void 0);
//# sourceMappingURL=create-consumer.dto.js.map