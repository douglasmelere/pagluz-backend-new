import { ContractsService } from "./contracts.service";
import { GenerateContractDto } from "./dto/generate-contract.dto";
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    generateContract(dto: GenerateContractDto): Promise<{
        contractId: string;
        documentUrl: string;
    }>;
}
