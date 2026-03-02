import { PhaseType } from '@prisma/client';
export declare class CreateProposalRequestDto {
    clientName: string;
    invoiceAmount: number;
    phaseType: PhaseType;
    kwhValue: number;
}
