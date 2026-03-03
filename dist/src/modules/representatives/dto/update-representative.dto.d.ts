import { CreateRepresentativeDto } from './create-representative.dto';
declare const UpdateRepresentativeDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateRepresentativeDto>>;
export declare class UpdateRepresentativeDto extends UpdateRepresentativeDto_base {
    email?: string;
    cpfCnpj?: string;
    password?: string;
}
export {};
