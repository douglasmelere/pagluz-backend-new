import { ContractsService } from "./contracts.service";
import { GenerateContractDto } from "./dto/generate-contract.dto";
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    getGenerators(): Promise<{
        id: any;
        nome: any;
        cpfCnpj: any;
        email: any;
        rua: any;
        numero: any;
        bairro: any;
        cidade: any;
        uf: any;
        cep: any;
        banco: any;
        agencia: any;
        conta: any;
        numeroUcGerador: any;
        tipoUsina: any;
        tipoDocumento: any;
    }[]>;
    generateContract(dto: GenerateContractDto): Promise<{
        contractId: string;
        documentUrl?: string;
        status?: string;
    }>;
}
