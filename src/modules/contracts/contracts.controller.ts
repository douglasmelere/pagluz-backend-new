import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ContractsService } from "./contracts.service";
import { GenerateContractDto } from "./dto/generate-contract.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { HierarchyAuthGuard, RequireHierarchy } from "../../common/guards/hierarchy-auth.guard";

@ApiTags("Contracts")
@Controller("contracts")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get("generators")
  @UseGuards(JwtAuthGuard, HierarchyAuthGuard)
  @RequireHierarchy("OPERATOR")
  @ApiOperation({
    summary: "Lista geradores para preencher formulário de contratos",
  })
  @ApiResponse({ status: 200, description: "Lista de geradores" })
  async getGenerators() {
    return this.contractsService.getGeneratorsFromN8n();
  }

  @Post("generate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Gera um contrato (locação, prestação ou procuração)",
  })
  @ApiResponse({
    status: 200,
    description: "Contrato gerado com sucesso",
    schema: {
      type: "object",
      properties: {
        contractId: { type: "string" },
        documentUrl: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "Dados inválidos" })
  @ApiResponse({ status: 500, description: "Erro ao gerar contrato" })
  async generateContract(@Body() dto: GenerateContractDto) {
    return this.contractsService.generateContract(dto);
  }
}
