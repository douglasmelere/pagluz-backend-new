import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
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

@ApiTags("Contracts")
@Controller("contracts")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

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
