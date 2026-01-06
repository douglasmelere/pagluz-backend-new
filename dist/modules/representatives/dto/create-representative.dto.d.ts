import { RepresentativeStatus } from '../../../common/enums';
export declare class CreateRepresentativeDto {
    name: string;
    email: string;
    password: string;
    cpfCnpj: string;
    phone: string;
    city: string;
    state: string;
    specializations?: string[];
    status?: RepresentativeStatus;
    notes?: string;
}
