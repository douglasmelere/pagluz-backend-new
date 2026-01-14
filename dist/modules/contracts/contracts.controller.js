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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const contracts_service_1 = require("./contracts.service");
const generate_contract_dto_1 = require("./dto/generate-contract.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let ContractsController = class ContractsController {
    contractsService;
    constructor(contractsService) {
        this.contractsService = contractsService;
    }
    async generateContract(dto) {
        return this.contractsService.generateContract(dto);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.Post)("generate"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: "Gera um contrato (locação, prestação ou procuração)",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Contrato gerado com sucesso",
        schema: {
            type: "object",
            properties: {
                contractId: { type: "string" },
                documentUrl: { type: "string" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Dados inválidos" }),
    (0, swagger_1.ApiResponse)({ status: 500, description: "Erro ao gerar contrato" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_contract_dto_1.GenerateContractDto]),
    __metadata("design:returntype", Promise)
], ContractsController.prototype, "generateContract", null);
exports.ContractsController = ContractsController = __decorate([
    (0, swagger_1.ApiTags)("Contracts"),
    (0, common_1.Controller)("contracts"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [contracts_service_1.ContractsService])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map