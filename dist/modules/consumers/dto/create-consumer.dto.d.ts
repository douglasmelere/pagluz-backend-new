import { ConsumerType, PhaseType, ConsumerStatus } from '@prisma/client';
export declare class CreateConsumerDto {
    name: string;
    cpfCnpj: string;
    ucNumber: string;
    concessionaire: string;
    city: string;
    state: string;
    consumerType: ConsumerType;
    phase: PhaseType;
    averageMonthlyConsumption: number;
    discountOffered: number;
    status?: ConsumerStatus;
    allocatedPercentage?: number;
    generatorId?: string;
    representativeId?: string;
}
