import { UserRole } from '../../../common/enums';
export declare class CreateUserDto {
    email: string;
    password: string;
    name?: string;
    role?: UserRole;
}
