import { SourceType, GeneratorStatus } from '@prisma/client';
export declare class CreateGeneratorDto {
    ownerName: string;
    cpfCnpj: string;
    sourceType: SourceType;
    installedPower: number;
    concessionaire: string;
    ucNumber: string;
    city: string;
    state: string;
    status?: GeneratorStatus;
    observations?: string;
}
