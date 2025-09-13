import { RepresentativeStatus } from '@prisma/client';
export declare class CreateRepresentativeDto {
    name: string;
    email: string;
    password: string;
    cpfCnpj: string;
    phone: string;
    city: string;
    state: string;
    commissionRate?: number;
    specializations?: string[];
    status?: RepresentativeStatus;
    notes?: string;
}
